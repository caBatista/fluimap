"use client";

import { useState } from "react";
import {
  useForm,
  useFieldArray,
  useWatch,
  type Control,
  type UseFormGetValues,
  type UseFormSetValue,
} from "react-hook-form";
import { z } from "zod";
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
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const ratingQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(5, "A pergunta deve ter ao menos 5 caracteres."),
  type: z.literal("rating"),
  options: z.array(z.object({ value: z.string() })).default([]),
});

const relationshipQuestionSchema = z.object({
  id: z.string(),
  text: z.string().min(5, "A pergunta deve ter ao menos 5 caracteres."),
  type: z.literal("relacionamento"),
  options: z
    .array(
      z.object({
        memberId: z.string(),
        name: z.string(),
        cargo: z.string(),
      }),
    )
    .default([]),
});

const questionSchema = z.discriminatedUnion("type", [
  ratingQuestionSchema,
  relationshipQuestionSchema,
]);

const surveyFormSchema = z.object({
  title: z.string().min(2, "Título deve ter pelo menos 2 caracteres."),
  description: z.string(),
  teamId: z.string().min(1, "Selecione um time."),
  dateClosing: z.string().nonempty("Insira a data de fechamento"),
  questions: z
    .array(questionSchema)
    .min(2, "São necessárias ao menos 2 perguntas"),
});

export type SurveyFormValues = z.infer<typeof surveyFormSchema>;

interface SurveyFormProps {
  onSuccess?: () => void;
}

interface RatingOptionsProps {
  questionIndex: number;
  control: Control<SurveyFormValues>;
  getValues: UseFormGetValues<SurveyFormValues>;
  setValue: UseFormSetValue<SurveyFormValues>;
}

function RatingOptions({
  questionIndex,
  control,
  getValues,
  setValue,
}: RatingOptionsProps) {
  const { fields, append, remove } = useFieldArray<
    SurveyFormValues,
    `questions.${number}.options`,
    "id"
  >({
    control,
    name: `questions.${questionIndex}.options`,
  });
  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Opções de escala
        </p>
        <Button
          type="button"
          variant="outline"
          className="h-[40px] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
          onClick={() => append({ value: "" })}
        >
          <PlusCircle className="h-4 w-4" />
          Adicionar opção
        </Button>
      </div>
      {fields.map((option, optionIndex) => {
        const currentOptions =
          (getValues(`questions.${questionIndex}.options`) as {
            value: string;
          }[]) || [];
        return (
          <div key={option.id} className="flex items-center gap-2">
            <Input
              placeholder={`Opção ${optionIndex + 1}`}
              value={currentOptions[optionIndex]?.value ?? ""}
              onChange={(e) => {
                const updated = [...currentOptions];
                updated[optionIndex] = { value: e.target.value };
                setValue(`questions.${questionIndex}.options`, updated);
              }}
              className="w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-[hsl(var(--muted-foreground))]"
              onClick={() => remove(optionIndex)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}
    </div>
  );
}

interface RelationshipOptionsProps {
  questionIndex: number;
  control: Control<SurveyFormValues>;
  getValues: UseFormGetValues<SurveyFormValues>;
  setValue: UseFormSetValue<SurveyFormValues>;
  members: { _id: string; name: string; cargo: string }[];
}

function RelationshipOptions({
  questionIndex,
  control,
  setValue,
  members,
}: RelationshipOptionsProps) {
  const selectedOptions =
    (useWatch({
      control,
      name: `questions.${questionIndex}.options`,
    }) as unknown as {
      memberId: string;
      name: string;
      cargo: string;
    }[]) || [];
  const isMemberSelected = (memberId: string): boolean =>
    selectedOptions.some((opt) => opt.memberId === memberId);
  const toggleSelection = (member: {
    _id: string;
    name: string;
    cargo: string;
  }) => {
    let updated = [...selectedOptions];
    if (isMemberSelected(member._id)) {
      updated = updated.filter((opt) => opt.memberId !== member._id);
    } else {
      updated.push({
        memberId: member._id,
        name: member.name,
        cargo: member.cargo,
      });
    }
    setValue(`questions.${questionIndex}.options`, updated);
  };

  return (
    <div className="mt-2 rounded-md">
      <p className="mb-2 text-sm text-[hsl(var(--muted-foreground))]">
        Membros do time:
      </p>
      {members.length === 0 ? (
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          Nenhum membro encontrado.
        </p>
      ) : (
        <div className="container grid gap-4 overflow-y-auto md:grid-cols-2 lg:grid-cols-6">
          {members.map((member) => {
            const selected = isMemberSelected(member._id);
            const initials = member.name
              .split(" ")
              .map((n) => n[0]?.toUpperCase())
              .join("")
              .slice(0, 2);
            return (
              <div
                key={member._id}
                onClick={() => toggleSelection(member)}
                className={`flex cursor-pointer flex-col items-center justify-start overflow-y-auto rounded-md border p-2 transition-colors ${
                  selected
                    ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10"
                    : "border-[hsl(var(--border))] bg-[hsl(var(--card))]"
                }`}
              >
                <div className="mb-1 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--foreground))]">
                  <span className="text-sm font-medium">{initials}</span>
                </div>
                <p className="items-between justify-between text-sm font-medium text-[hsl(var(--foreground))]">
                  {member.name}
                </p>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  {member.cargo}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

const mockTeams = [
  { _id: "team1", name: "Time 1" },
  { _id: "team2", name: "Time 2" },
  { _id: "team3", name: "Time 3" },
];

const mockTeamMembers = [
  { _id: "m1", name: "João Pereira", cargo: "Desenvolvedor" },
  { _id: "m2", name: "Maria Silva", cargo: "Designer" },
  { _id: "m3", name: "Carlos Souza", cargo: "Gerente" },
  { _id: "m4", name: "Ana Costa", cargo: "Analista" },
  { _id: "m5", name: "João Pereira", cargo: "Desenvolvedor" },
  { _id: "m6", name: "Maria Silva", cargo: "Designer" },
  { _id: "m7", name: "Carlos Souza", cargo: "Gerente" },
];

export function SurveyForm({ onSuccess }: SurveyFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const { data: teams = mockTeams } = useQuery<{ _id: string; name: string }[]>(
    {
      queryKey: ["teams"],
      queryFn: async (): Promise<{ _id: string; name: string }[]> => {
        const response = await fetch("/api/teams");
        if (!response.ok) {
          throw new Error("Falha ao buscar times");
        }
        const data = (await response.json()) as {
          teams: { _id: string; name: string }[];
        };
        return data.teams || [];
      },
    },
  );

  const form = useForm<SurveyFormValues>({
    resolver: zodResolver(surveyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      teamId: "",
      dateClosing: "",
      questions: [
        {
          id: crypto.randomUUID(),
          text: "Texto da pergunta 1",
          type: "relacionamento",
          options: [],
        },
        {
          id: crypto.randomUUID(),
          text: "Texto da pergunta 2",
          type: "rating",
          options: [],
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray<
    SurveyFormValues,
    "questions",
    "id"
  >({
    control: form.control,
    name: "questions",
  });

  async function onSubmit(data: SurveyFormValues): Promise<void> {
    setIsSubmitting(true);
    try {
      const transformedData = {
        ...data,
        questions: data.questions.map((q) => {
          if (q.type === "rating") {
            return {
              ...q,
              options: q.options.map((opt) => opt.value),
            };
          }
          return q;
        }),
      };
      const response = await fetch("/api/surveys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(transformedData),
      });
      if (!response.ok) {
        const err = (await response.json()) as { error: string };
        throw new Error(err.error ?? "Erro ao criar formulário");
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/surveys", undefined);
      }
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
        className="mb-[27px] ml-[27px] mt-[25px] h-screen w-[1161px] space-y-6"
      >
        <Card className="border border-[hsl(var(--border))] bg-[hsl(var(--card))]">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-[hsl(var(--foreground))]">
              Cadastrar Formulário
            </CardTitle>
            <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
              Crie uma pesquisa para avaliar a dinâmica e os relacionamentos da
              equipe
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--muted-foreground))]">
                    Título do Formulário
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o título do formulário"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[hsl(var(--muted-foreground))]">
                    Descrição
                  </FormLabel>
                  <FormControl className="h-[71px] w-[1110px]">
                    <Textarea
                      placeholder="Breve descrição do objetivo do formulário"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel className="text-[hsl(var(--muted-foreground))]">
                      Time
                    </FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger className="h-[40px] w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                          <SelectValue placeholder="Selecione um time" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team._id} value={team._id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateClosing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[hsl(var(--muted-foreground))]">
                      Término em
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        placeholder="DD/MM/AAAA"
                        {...field}
                        className="h-[40px] w-[150px] rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="mb-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-[hsl(var(--foreground))]">
                  Perguntas da Pesquisa
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  className="h-[40px] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
                  onClick={() =>
                    append({
                      id: crypto.randomUUID(),
                      text: "",
                      type: "relacionamento",
                      options: [],
                    })
                  }
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar pergunta
                </Button>
              </div>
              {fields.map((field, index) => {
                const questionType = form.getValues(`questions.${index}.type`);
                return (
                  <Card
                    key={field.id}
                    className="border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4"
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-medium text-[hsl(var(--foreground))]">
                        Pergunta {index + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-[hsl(var(--muted-foreground))]"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormField
                      control={form.control}
                      name={`questions.${index}.text`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-[hsl(var(--muted-foreground))]">
                            Texto da pergunta
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Digite sua pergunta?"
                              {...f}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`questions.${index}.type`}
                      render={({ field: f }) => (
                        <FormItem className="mt-4">
                          <FormLabel className="h-[40px] text-[hsl(var(--muted-foreground))]">
                            Tipo de pergunta
                          </FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={f.onChange}
                              defaultValue={f.value}
                            >
                              <SelectTrigger className="h-[40px] w-full rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm text-[hsl(var(--muted-foreground))]">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="relacionamento">
                                  Relacionamento
                                </SelectItem>
                                <SelectItem value="rating">Escala</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
                            Avaliar relacionamentos entre os membros da equipe
                          </p>
                        </FormItem>
                      )}
                    />
                    {questionType === "rating" && (
                      <RatingOptions
                        questionIndex={index}
                        control={form.control}
                        getValues={form.getValues}
                        setValue={form.setValue}
                      />
                    )}
                    {questionType === "relacionamento" && (
                      <RelationshipOptions
                        questionIndex={index}
                        control={form.control}
                        getValues={form.getValues}
                        setValue={form.setValue}
                        members={mockTeamMembers}
                      />
                    )}
                  </Card>
                );
              })}
            </div>
          </CardContent>
          <CardFooter className="justify-between space-x-2">
            <Button
              variant="outline"
              type="button"
              className="h-[40px] border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]"
              onClick={() => router.push("/surveys")}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="h-[40px] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90"
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
