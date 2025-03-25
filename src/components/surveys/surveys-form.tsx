"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Plus, Trash2, ChevronDown } from "lucide-react";

const questionSchema = z.object({
  id: z.string(),
  text: z.string().min(5, "Pergunta deve ter ao menos 5 caracteres."),
  type: z.enum(["relacionamento", "rating", "text"]),
});

const surveyFormSchema = z.object({
  title: z.string().min(2, "Título deve ter ao menos 2 caracteres."),
  description: z.string().optional(),
  teamId: z.string().min(1, "Selecione um time."),
  questions: z.array(questionSchema).min(1, "É preciso ao menos 1 pergunta"),
});

type SurveyFormValues = z.infer<typeof surveyFormSchema>;

interface SurveyFormProps {
  onSuccess?: () => void;
}

export function SurveyForm({ onSuccess }: SurveyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      teamId: "",
      questions: [
        {
          id: crypto.randomUUID(),
          text: "Texto da pergunta",
          type: "relacionamento",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(data: SurveyFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error: string };
        throw new Error(err.error || "Erro ao criar formulário");
      }
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error(error);
        alert("Falha ao criar formulário: " + error.message);
      } else {
        console.error(error);
        alert("Falha ao criar formulário. Ver console.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="ml-[27px] mt-[24px] w-[1161px] space-y-6"
      >
        <Card className="border border-[#E7E5E4] bg-[#FFFFFF]">
          <CardHeader>
            <CardTitle className="text-[#111827]">
              Cadastrar Formulário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Título */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#4B5563]">
                    Título do Formulário
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Pesquisa de Satisfação"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#4B5563]">Descrição</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Breve descrição do objetivo da pesquisa"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Time */}
            <FormField
              control={form.control}
              name="teamId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[#4B5563]">Time</FormLabel>
                  <FormControl>
                    <select
                      className="w-full rounded-md border border-[#E7E5E4] bg-white px-3 py-2 text-[#4B5563]"
                      {...field}
                    >
                      <option value="">Selecione um time</option>
                      <option value="time-exemplo-1">Exemplo de Time 1</option>
                      <option value="time-exemplo-2">Exemplo de Time 2</option>
                      <option value="time-exemplo-3">Exemplo de Time 3</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Perguntas */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[#111827]">
                  Perguntas da Pesquisa
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  className="border-[#E7E5E4] text-[#4B5563]"
                  onClick={() =>
                    append({
                      id: crypto.randomUUID(),
                      text: "",
                      type: "relacionamento",
                    })
                  }
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar pergunta
                </Button>
              </div>

              {fields.map((field, index) => (
                <Card
                  key={field.id}
                  className="border border-[#E7E5E4] bg-white p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <p className="font-medium text-[#111827]">
                      Pergunta {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-[#4B5563]"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Texto da pergunta */}
                  <FormField
                    control={form.control}
                    name={`questions.${index}.text`}
                    render={({ field: f }) => (
                      <FormItem>
                        <FormLabel className="text-[#4B5563]">
                          Texto da pergunta
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Ex: Como você avalia o relacionamento com a equipe?"
                            {...f}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Tipo da pergunta */}
                  <FormField
                    control={form.control}
                    name={`questions.${index}.type`}
                    render={({ field: f }) => (
                      <FormItem className="mt-4">
                        <FormLabel className="text-[#4B5563]">
                          Tipo de pergunta
                        </FormLabel>
                        <FormControl>
                          <select
                            className="w-full rounded-md border border-[#E7E5E4] bg-white px-3 py-2 text-[#4B5563]"
                            {...f}
                          >
                            <option value="relacionamento">
                              Relacionamento
                            </option>
                            <option value="rating">Escala (1-5)</option>
                            <option value="text">Texto aberto</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </Card>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-end space-x-2">
            <Button
              variant="outline"
              type="button"
              className="border-[#E7E5E4] text-[#4B5563]"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#3C83F6] text-white hover:bg-[#3C83F6]/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Criando..." : "Criar Pesquisa"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
