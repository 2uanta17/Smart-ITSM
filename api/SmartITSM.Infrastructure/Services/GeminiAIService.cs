using System.Text;
using System.Text.Json;

using Microsoft.Extensions.Configuration;

using SmartITSM.Application.DTOs;
using SmartITSM.Application.Interfaces;
using SmartITSM.Core.Enums;
using SmartITSM.Core.Interfaces;

namespace SmartITSM.Infrastructure.Services;

public class GeminiAIService : IAIService
{
    private const string GeminiBaseUrl = "https://generativelanguage.googleapis.com/v1beta/models";

    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ICategoryRepository _categoryRepository;

    public GeminiAIService(HttpClient httpClient, IConfiguration configuration, ICategoryRepository categoryRepository)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _categoryRepository = categoryRepository;
    }

    public async Task<AIPredictionResponseDto> PredictTicketRoutingAsync(AIPredictionRequestDto request)
    {
        string? apiKey = _configuration["Gemini:ApiKey"];
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Gemini API key is missing.");
        }

        var categories = (await _categoryRepository.GetAllAsync()).OrderBy(c => c.Id).ToList();
        if (categories.Count == 0)
        {
            throw new InvalidOperationException("No ticket categories are configured.");
        }

        string categoriesText = string.Join(", ", categories.Select(c => $"{c.Id}:{c.Name}"));
        string prioritiesText = string.Join(", ", Enum.GetValues<TicketPriority>().Select(p => $"{(int)p}:{p}"));

        string prompt = string.Join('\n',
        [
            "You are a strict ITSM ticket routing assistant.",
            string.Empty,
            "Predict the best category and priority for this ticket.",
            string.Empty,
            $"Valid Category IDs (must choose one): {categoriesText}",
            $"Valid Priority enum integers (must choose one): {prioritiesText}",
            string.Empty,
            $"Ticket Title: {request.Title}",
            $"Ticket Description: {request.Description}",
            string.Empty,
            "Return ONLY JSON. No markdown, no explanation, no extra text.",
            "Required JSON schema:",
            "{\"categoryId\": <int>, \"priority\": <int>}"
        ]);

        var payload = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            },
            generationConfig = new
            {
                responseMimeType = "application/json",
                temperature = 0.1
            }
        };

        string[] preferredModels =
        [
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-3-flash",
            "gemini-3.1-flash-lite"
        ];

        string? successfulResponse = null;
        string? lastError = null;
        bool allFailedWithRateLimit = true;

        foreach (string model in preferredModels)
        {
            string endpoint = $"{GeminiBaseUrl}/{model}:generateContent?key={apiKey}";
            using HttpRequestMessage httpRequest = new(HttpMethod.Post, endpoint)
            {
                Content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json")
            };

            using HttpResponseMessage response = await _httpClient.SendAsync(httpRequest);
            string rawResponse = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                successfulResponse = rawResponse;
                allFailedWithRateLimit = false;
                break;
            }

            string errorDetails = ExtractGeminiErrorMessage(rawResponse);
            lastError = $"{model}: {(int)response.StatusCode} {response.ReasonPhrase}. {errorDetails}";

            // If model is unavailable or temporarily throttled, try the next fallback model.
            if ((int)response.StatusCode == 404 || (int)response.StatusCode == 429)
            {
                if ((int)response.StatusCode != 429)
                {
                    allFailedWithRateLimit = false;
                }

                continue;
            }

            allFailedWithRateLimit = false;

            throw new InvalidOperationException($"Gemini request failed ({lastError}).");
        }

        if (successfulResponse == null)
        {
            if (allFailedWithRateLimit)
            {
                throw new InvalidOperationException("Gemini is currently rate limited. Please try again in a minute.");
            }

            throw new InvalidOperationException(
                $"Gemini request failed for all configured models. Last error: {lastError ?? "unknown"}.");
        }

        string candidateText = ExtractCandidateText(successfulResponse);
        string cleanJson = StripCodeFences(candidateText);

        AIPredictionResponseDto? prediction = JsonSerializer.Deserialize<AIPredictionResponseDto>(
            cleanJson,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

        if (prediction == null)
        {
            throw new InvalidOperationException("Gemini returned an empty prediction.");
        }

        bool validCategory = categories.Any(c => c.Id == prediction.CategoryId);
        bool validPriority = Enum.IsDefined(typeof(TicketPriority), prediction.Priority);

        if (!validCategory || !validPriority)
        {
            throw new InvalidOperationException("Gemini returned invalid category or priority values.");
        }

        return prediction;
    }

    private static string ExtractCandidateText(string rawResponse)
    {
        using JsonDocument document = JsonDocument.Parse(rawResponse);

        JsonElement root = document.RootElement;
        JsonElement candidates = root.GetProperty("candidates");
        JsonElement firstCandidate = candidates[0];
        JsonElement content = firstCandidate.GetProperty("content");
        JsonElement parts = content.GetProperty("parts");
        JsonElement firstPart = parts[0];

        return firstPart.GetProperty("text").GetString() ?? throw new InvalidOperationException("Gemini response text was empty.");
    }

    private static string ExtractGeminiErrorMessage(string rawResponse)
    {
        if (string.IsNullOrWhiteSpace(rawResponse))
        {
            return "No error body returned by Gemini.";
        }

        try
        {
            using JsonDocument document = JsonDocument.Parse(rawResponse);
            JsonElement root = document.RootElement;

            if (root.TryGetProperty("error", out JsonElement error))
            {
                string? message = error.TryGetProperty("message", out JsonElement messageEl)
                    ? messageEl.GetString()
                    : null;

                string? status = error.TryGetProperty("status", out JsonElement statusEl)
                    ? statusEl.GetString()
                    : null;

                if (!string.IsNullOrWhiteSpace(message) && !string.IsNullOrWhiteSpace(status))
                {
                    return $"Gemini status={status}, message={message}";
                }

                if (!string.IsNullOrWhiteSpace(message))
                {
                    return $"Gemini message={message}";
                }
            }
        }
        catch
        {
            // Fall back to a shortened raw response snippet.
        }

        const int maxLen = 300;
        return rawResponse.Length <= maxLen
            ? rawResponse
            : rawResponse[..maxLen] + "...";
    }

    private static string StripCodeFences(string content)
    {
        string trimmed = content.Trim();

        if (trimmed.StartsWith("```", StringComparison.Ordinal))
        {
            int firstNewLine = trimmed.IndexOf('\n');
            if (firstNewLine >= 0)
            {
                trimmed = trimmed[(firstNewLine + 1)..];
            }

            int closingFence = trimmed.LastIndexOf("```", StringComparison.Ordinal);
            if (closingFence >= 0)
            {
                trimmed = trimmed[..closingFence];
            }
        }

        return trimmed.Trim();
    }
}
