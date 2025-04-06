import { SignInCard } from "@/components/sign-in-card"
import { SignUpCard } from "@/components/sign-up-card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { ChartColumn, ClipboardList, Lightbulb } from "lucide-react"

export default function AuthPage() {
  return (
    <div className="flex w-full h-screen">
      <div className="w-1/2 flex items-center justify-center flex-col">
        <h1 className="text-2xl text-[#3C83F6] font-bold">FluiMap</h1>
        <p className="text-muted-foreground mt-2">Plataforma de Avaliação de Dinâmica de Equipe</p>
        <Tabs defaultValue="signin" className="w-full max-w-md mt-10">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInCard />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpCard />
          </TabsContent>
        </Tabs>
      </div>

      <div className="w-1/2 bg-gradient-to-br from-[#3B82F6] to-[#4338CA] text-white flex items-center justify-center">
        <div className="ml-20 mr-20 text-left text-white max-w-full">
          <h1 className="text-4xl font-bold">Entenda a dinâmica da sua equipe como nunca antes</h1>
          <p className="mt-14 text-lg">
            O FluiMap ajuda você a avaliar e visualizar as relações da equipe, identificar pontos fortes e oportunidades de crescimento e construir equipes mais eficazes.
          </p>
          <div className="mt-10 flex flex-col gap-8">
            <div className="flex items-start">
              <div className="mr-3 flex h-12 w-12 aspect-square items-center justify-center rounded-full bg-white/20 text-white">
                <ChartColumn className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Visualização dinâmica</p>
                <p className="mt-1 text-sm">
                  Gráficos de rede interativos revelam os relacionamentos dentro da sua equipe.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 flex h-12 w-12 aspect-square items-center justify-center rounded-full bg-white/20 text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Avaliações Simples</p>
                <p className="mt-1 text-sm">
                  Pesquisas fáceis de completar fornecem insights profundos com o mínimo de esforço.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 flex h-12 w-12 aspect-square items-center justify-center rounded-full bg-white/20 text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Insights Acionáveis</p>
                <p className="mt-1 text-sm">
                  Transforme dados em estratégias práticas para a melhoria da equipe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}