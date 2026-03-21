import {
  createTicket,
  predictTicketRouting,
} from "@/features/tickets/api/ticketApi";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";
import {
  Button,
  Container,
  FileInput,
  Group,
  LoadingOverlay,
  Paper,
  Select,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  name: string;
  defaultPriority: string;
}

interface CreateTicketFormValues {
  title: string;
  description: string;
  priority: string;
  categoryId: string;
}

const getCategories = async () => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};

export const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "",
      categoryId: "",
    },
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      notifications.show({
        title: "Success",
        message: "Ticket created",
        color: "green",
      });
      navigate("/app/tickets");
    },
    onError: (err) => {
      notifications.show({
        title: "Error",
        message: getErrorMessage(err),
        color: "red",
      });
    },
  });

  const onSubmit = (data: CreateTicketFormValues) => {
    mutation.mutate({
      ...data,
      attachment: file,
    });
  };

  const handleAIPrediction = async () => {
    const title = getValues("title")?.trim();
    const description = getValues("description")?.trim();

    if (!title || !description) {
      notifications.show({
        title: "Missing input",
        message:
          "Please enter both Title and Description before AI prediction.",
        color: "yellow",
      });
      return;
    }

    try {
      setIsAILoading(true);
      const prediction = await predictTicketRouting(title, description);

      setValue("categoryId", prediction.categoryId.toString(), {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("priority", prediction.priority.toString(), {
        shouldDirty: true,
        shouldValidate: true,
      });

      notifications.show({
        title: "Success",
        message: "AI Prediction applied successfully.",
        color: "green",
      });
    } catch (error) {
      notifications.show({
        title: "AI Prediction Failed",
        message: getErrorMessage(error),
        color: "red",
      });
    } finally {
      setIsAILoading(false);
    }
  };

  const priorityOptions = [
    { value: "0", label: "Low" },
    { value: "1", label: "Medium" },
    { value: "2", label: "High" },
    { value: "3", label: "Critical" },
  ];

  const categoryOptions = categories.map((c) => ({
    value: c.id.toString(),
    label: c.name,
  }));

  return (
    <Container size="sm">
      <Title order={2} mb="lg">
        Submit New Ticket
      </Title>
      <Paper withBorder p="md" pos="relative">
        <LoadingOverlay
          visible={isLoadingCategories || mutation.isPending || isAILoading}
        />

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Subject"
            {...register("title", { required: "Title is required" })}
            error={errors.title?.message as string}
            mb="sm"
          />

          <Textarea
            label="Description"
            minRows={4}
            {...register("description", {
              required: "Description is required",
            })}
            error={errors.description?.message as string}
            mb="sm"
          />

          <Controller
            name="categoryId"
            control={control}
            rules={{ required: "Please select a category" }}
            render={({ field }) => (
              <Select
                label="Category"
                placeholder="Select a category"
                data={categoryOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.categoryId?.message as string}
                mb="sm"
                required
              />
            )}
          />

          <Controller
            name="priority"
            control={control}
            rules={{ required: "Please select a priority" }}
            render={({ field }) => (
              <Select
                label="Priority"
                placeholder="Select priority"
                data={priorityOptions}
                value={field.value}
                onChange={field.onChange}
                error={errors.priority?.message as string}
                mb="sm"
              />
            )}
          />

          <Button
            type="button"
            variant="light"
            onClick={handleAIPrediction}
            loading={isAILoading}
            disabled={mutation.isPending || isLoadingCategories}
            fullWidth
            mt="xl"
            mb="md"
          >
            Auto-Fill using AI
          </Button>

          <FileInput
            label="Attachment (Optional)"
            placeholder="Upload image"
            value={file}
            onChange={setFile}
            mb="lg"
            clearable
          />

          <Group grow>
            <Button type="submit" loading={mutation.isPending} fullWidth>
              Submit Ticket
            </Button>
          </Group>
        </form>
      </Paper>
    </Container>
  );
};
