'use client'
import * as Clerk from '@clerk/elements/common'
import * as SignIn from '@clerk/elements/sign-in'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icons } from '@/components/ui/icons'
import { getErrorMessage } from "@/lib/utils";


export function SignInCard() {
  return (
        <SignIn.Root>
          <Clerk.Loading>
            {(isGlobalLoading) => (
              <>
                <SignIn.Step name="start">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-2xl">Login</CardTitle>
                      <CardDescription>Digite suas credenciais para acessar sua conta</CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-y-4">
                      <Clerk.Field name="identifier" className="space-y-2">
                        <Clerk.Label asChild>
                          <Label>E-mail</Label>
                        </Clerk.Label>
                        <Clerk.Input type="email" required asChild>
                          <Input />
                        </Clerk.Input>
                        <Clerk.FieldError className="block text-sm text-destructive">
                          {({ code }) => <span>{getErrorMessage(code)}</span>}
                        </Clerk.FieldError>
                      </Clerk.Field>
                      <SignIn.Action submit asChild>
                          <Button 
                              disabled={isGlobalLoading}
                              className="bg-[#3C83F6] hover:bg-blue-600 text-white"
                          >
                          <Clerk.Loading>
                              {(isLoading) => {
                              return isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                              ) : (
                                  'Login'
                              )
                              }}
                          </Clerk.Loading>
                          </Button>
                      </SignIn.Action>
                      <p className="flex items-center gap-x-3 text-xs text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                        OU CONTINUE COM
                      </p>
                      <div className="grid grid-cols-1 gap-x-4">
                        <Clerk.Connection name="google" asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            type="button"
                            disabled={isGlobalLoading}
                          >
                            <Clerk.Loading scope="provider:google">
                              {(isLoading) =>
                                isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <Icons.google className="mr-2 size-4" />
                                    Google
                                  </>
                                )
                              }
                            </Clerk.Loading>
                          </Button>
                        </Clerk.Connection>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="grid w-full gap-y-4">
                        <Button variant="link" size="sm" asChild>
                          <Clerk.Link navigate="sign-up">
                            Não tem uma conta? Crie uma
                          </Clerk.Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </SignIn.Step>
  
                <SignIn.Step name="choose-strategy">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="text-2xl">Usar outro método</CardTitle>
                      <CardDescription>
                        Enfrentando problemas? Você pode usar qualquer um destes métodos para fazer login.      
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-y-4">
                      <SignIn.SupportedStrategy name="email_code" asChild>
                        <Button type="button" variant="link" disabled={isGlobalLoading}>
                          Código por e-mail
                        </Button>
                      </SignIn.SupportedStrategy>
                      <SignIn.SupportedStrategy name="password" asChild>
                        <Button type="button" variant="link" disabled={isGlobalLoading}>
                          Senha
                        </Button>
                      </SignIn.SupportedStrategy>
                    </CardContent>
                    <CardFooter>
                      <div className="grid w-full gap-y-4">
                        <SignIn.Action navigate="previous" asChild>
                          <Button 
                              disabled={isGlobalLoading}
                              className="bg-[#3C83F6] hover:bg-blue-600 text-white"    
                          >
                            <Clerk.Loading>
                              {(isLoading) => {
                                return isLoading ? (
                                  <Icons.spinner className="size-4 animate-spin" />
                                ) : (
                                  'Voltar'
                                )
                              }}
                            </Clerk.Loading>
                          </Button>
                        </SignIn.Action>
                      </div>
                    </CardFooter>
                  </Card>
                </SignIn.Step>
  
                <SignIn.Step name="verifications">
                  <SignIn.Strategy name="password">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">Senha</CardTitle>
                        <CardDescription>
                          Digite a senha cadastrada para sua conta
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-y-4">
                        <Clerk.Field name="password" className="space-y-2">
                          <Clerk.Input type="password" asChild>
                            <Input />
                          </Clerk.Input>
                          <Clerk.FieldError className="block text-sm text-destructive">
                            {({ code }) => <span>{getErrorMessage(code)}</span>}
                          </Clerk.FieldError>
                        </Clerk.Field>
                      </CardContent>
                      <CardFooter>
                        <div className="grid w-full gap-y-4">
                          <SignIn.Action submit asChild>
                            <Button 
                              disabled={isGlobalLoading}
                              className="bg-[#3C83F6] hover:bg-blue-600 text-white"
                          >
                              <Clerk.Loading>
                                {(isLoading) => {
                                  return isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    'Continue'
                                  )
                                }}
                              </Clerk.Loading>
                            </Button>
                          </SignIn.Action>
                          <SignIn.Action navigate="start" asChild>
                            <Button type="button" variant="outline" size="sm">
                              Voltar
                            </Button>
                          </SignIn.Action>
                          <SignIn.Action navigate="choose-strategy" asChild>
                            <Button type="button" size="sm" variant="link">
                              Use outro método
                            </Button>
                          </SignIn.Action>
                        </div>
                      </CardFooter>
                    </Card>
                  </SignIn.Strategy>
  
                  <SignIn.Strategy name="email_code">
                    <Card className="w-full">
                      <CardHeader>
                        <CardTitle className="text-2xl">Verifique seu E-mail</CardTitle>
                        <CardDescription>
                          Digite o código de validação enviado para seu e-mail
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="grid gap-y-4">
                        <Clerk.Field name="code">
                          <Clerk.Label className="sr-only">Digite o código de validação enviado para seu e-mail</Clerk.Label>
                          <div className="grid gap-y-2 items-center justify-center">
                            <div className="flex justify-center text-center">
                              <Clerk.Input
                                type="otp"
                                autoSubmit
                                className="flex justify-center has-[:disabled]:opacity-50"
                                render={({ value, status }) => {
                                  return (
                                    <div
                                      data-status={status}
                                      className="relative flex h-9 w-9 items-center justify-center border-y border-r border-input text-sm shadow-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md data-[status=selected]:ring-1 data-[status=selected]:ring-ring data-[status=cursor]:ring-1 data-[status=cursor]:ring-ring"
                                    >
                                      {value}
                                    </div>
                                  )
                                }}
                              />
                            </div>
                            <Clerk.FieldError className="block text-sm text-destructive">
                              {({ code }) => <span>{getErrorMessage(code)}</span>}
                            </Clerk.FieldError>
                            <SignIn.Action
                              asChild
                              resend
                              className="text-muted-foreground"
                              fallback={({ resendableAfter }) => (
                                <Button variant="link" size="sm" disabled>
                                  Não recebeu um código? Reenviar (
                                  <span className="tabular-nums">{resendableAfter}</span>)
                                </Button>
                              )}
                            >
                              <Button variant="link" size="sm">
                                  Não recebeu um código? Reenviar
                              </Button>
                            </SignIn.Action>
                          </div>
                        </Clerk.Field>
                      </CardContent>
                      <CardFooter>
                        <div className="grid w-full gap-y-4">
                          <SignIn.Action submit asChild>
                            <Button 
                              disabled={isGlobalLoading}
                              className="bg-[#3C83F6] hover:bg-blue-600 text-white"
                            >
                              <Clerk.Loading>
                                {(isLoading) => {
                                  return isLoading ? (
                                    <Icons.spinner className="size-4 animate-spin" />
                                  ) : (
                                    'Continuar'
                                  )
                                }}
                              </Clerk.Loading>
                            </Button>
                          </SignIn.Action>
                          <SignIn.Action navigate="choose-strategy" asChild>
                            <Button size="sm" variant="link">
                              Usar outro método
                            </Button>
                          </SignIn.Action>
                        </div>
                      </CardFooter>
                    </Card>
                  </SignIn.Strategy>
                </SignIn.Step>
              </>
            )}
          </Clerk.Loading>
        </SignIn.Root>
    )
}