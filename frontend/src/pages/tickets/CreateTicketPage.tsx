import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  TextInput,
  Textarea,
  Select,
  FileInput,
  Button,
  Title,
  Paper,
  Container,
  LoadingOverlay,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { createTicket } from "@/features/tickets/api/ticketApi";
import api from "@/lib/axios";
import { getErrorMessage } from "@/lib/utils";

interface Category {
  id: number;
  name: string;
  defaultPriority: string;
}

const getCategories = async () => {
  const { data } = await api.get<Category[]>("/categories");
  return data;
};

export const CreateTicketPage = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      priority: "1",
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

  const onSubmit = (data: any) => {
    mutation.mutate({
      ...data,
      attachment: file,
    });
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
        <LoadingOverlay visible={isLoadingCategories || mutation.isPending} />

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextInput
            label="Subject"
            {...register("title", { required: "Title is required" })}
            error={errors.title?.message as string}
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
            render={({ field }) => (
              <Select
                label="Priority"
                data={priorityOptions}
                value={field.value}
                onChange={field.onChange}
                mb="sm"
              />
            )}
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

          <FileInput
            label="Attachment (Optional)"
            placeholder="Upload image"
            value={file}
            onChange={setFile}
            mb="lg"
            clearable
          />

          <Button type="submit" loading={mutation.isPending} fullWidth>
            Submit Ticket
          </Button>
        </form>
      </Paper>
    </Container>
  );
};
