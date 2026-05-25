# --- Stage 1: Build ---
# Use the .NET 9 SDK image to build the application
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files first to restore dependencies
# This leverages Docker cache for faster subsequent builds
COPY ["SmartITSM.sln", "./"]
COPY ["SmartITSM.API/SmartITSM.API.csproj", "SmartITSM.API/"]
COPY ["SmartITSM.Application/SmartITSM.Application.csproj", "SmartITSM.Application/"]
COPY ["SmartITSM.Core/SmartITSM.Core.csproj", "SmartITSM.Core/"]
COPY ["SmartITSM.Infrastructure/SmartITSM.Infrastructure.csproj", "SmartITSM.Infrastructure/"]

# Restore NuGet packages
RUN dotnet restore "SmartITSM.sln"

# Copy the remaining source code
COPY . .

# Build and publish the API project
# -c Release: Build in Release mode
# -o /app/publish: Output the build artifacts to this folder
RUN dotnet publish "SmartITSM.API/SmartITSM.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# --- Stage 2: Run ---
# Use the lightweight ASP.NET runtime image for the final image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Expose the ports the app runs on
EXPOSE 8080

# Copy the published artifacts from the build stage
COPY --from=build /app/publish .

# Set environment variables for the application
# ASPNETCORE_URLS tells .NET which port to listen on inside the container
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Start the application
ENTRYPOINT ["dotnet", "SmartITSM.API.dll"]
