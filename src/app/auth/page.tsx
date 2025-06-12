"use client";
import Image from 'next/image';
import { useState } from 'react';
import { SignInCard } from '@/components/sign-in-card';
import { SignUpCard } from '@/components/sign-up-card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartColumn, ClipboardList, Lightbulb } from 'lucide-react';

export default function AuthPage() {
  const [tab, setTab] = useState('signin');
  return (
    <div className="flex h-screen w-full bg-white transition-colors duration-300 dark:bg-zinc-900">
      <div className="flex w-1/2 flex-col items-center justify-center">
        {/* Logo */}
        <div className="flex items-center justify-center">
          <Image
            src="/LogoFluiMap.png"
            alt="Logo do FluiMap"
            width={200}
            height={200}
            className="mb-6 dark:invert"
          />
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full max-w-md">
          <TabsList className="grid w-full grid-cols-2 bg-zinc-100 dark:bg-zinc-800">
            <TabsTrigger value="signin">Login</TabsTrigger>
            <TabsTrigger value="signup">Cadastro</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <SignInCard onSwitchToSignUp={() => setTab('signup')} />
          </TabsContent>
          <TabsContent value="signup">
            <SignUpCard onSwitchToSignIn={() => setTab('signin')} />
          </TabsContent>
        </Tabs>
      </div>

      <div className="flex w-1/2 items-center justify-center bg-gradient-to-br from-[#3B82F6] to-[#4338CA] text-white dark:from-[#1e3a8a] dark:to-[#312e81]">
        <div className="ml-20 mr-20 max-w-full text-left text-white">
          <h1 className="text-4xl font-bold">Entenda a dinâmica da sua equipe como nunca antes</h1>
          <p className="mt-14 text-lg text-white/90 dark:text-white/80">
            O FluiMap ajuda você a avaliar e visualizar as relações da equipe, identificar pontos
            fortes e oportunidades de crescimento e construir equipes mais eficazes.
          </p>
          <div className="mt-10 flex flex-col gap-8">
            <div className="flex items-start">
              <div className="mr-3 flex aspect-square h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <ChartColumn className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Visualização dinâmica</p>
                <p className="mt-1 text-sm text-white/80">
                  Gráficos de rede interativos revelam os relacionamentos dentro da sua equipe.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 flex aspect-square h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <ClipboardList className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Avaliações Simples</p>
                <p className="mt-1 text-sm text-white/80">
                  Pesquisas fáceis de completar fornecem insights profundos com o mínimo de esforço.
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="mr-3 flex aspect-square h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div>
                <p className="text-lg font-semibold">Insights Acionáveis</p>
                <p className="mt-1 text-sm text-white/80">
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
