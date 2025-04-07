'use client'
import * as Clerk from '@clerk/elements/common'
import * as SignUp from '@clerk/elements/sign-up'
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
import { cn, getErrorMessage } from '@/lib/utils'

export function SignUpCard() {
  return (
      <SignUp.Root>
        <Clerk.Loading>
          {(isGlobalLoading) => (
            <>
              <SignUp.Step name="start">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle className="text-2xl">Criar uma conta</CardTitle>
                    <CardDescription>
                        Insira suas informações para criar uma nova conta
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-y-4">
                    <Clerk.Field name="emailAddress" className="space-y-2">
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
                    <Clerk.Field name="password" className="space-y-2">
                      <Clerk.Label asChild>
                        <Label>Senha</Label>
                      </Clerk.Label>
                      <Clerk.Input type="password" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive">
                        {({ code }) => <span>{getErrorMessage(code)}</span>}
                      </Clerk.FieldError>
                    </Clerk.Field>
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
                      <SignUp.Captcha className="empty:hidden" />
                      <SignUp.Action submit asChild>
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
                      </SignUp.Action>
                      <Button variant="link" size="sm" asChild>
                        <Clerk.Link navigate="sign-in">Já tem uma conta? Fazer login</Clerk.Link>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </SignUp.Step>

              <SignUp.Step name="continue">
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Continue registration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Clerk.Field name="username" className="space-y-2">
                      <Clerk.Label>
                        <Label>Username</Label>
                      </Clerk.Label>
                      <Clerk.Input type="text" required asChild>
                        <Input />
                      </Clerk.Input>
                      <Clerk.FieldError className="block text-sm text-destructive">
                        {({ code }) => <span>{getErrorMessage(code)}</span>}
                      </Clerk.FieldError>
                    </Clerk.Field>
                  </CardContent>
                  <CardFooter>
                    <div className="grid w-full gap-y-4">
                      <SignUp.Action submit asChild>
                        <Button disabled={isGlobalLoading}>
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
                      </SignUp.Action>
                    </div>
                  </CardFooter>
                </Card>
              </SignUp.Step>

              <SignUp.Step name="verifications">
                <SignUp.Strategy name="email_code">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle>Verifique seu E-mail</CardTitle>
                      <CardDescription>
                      Digite o código de validação enviado para seu e-mail
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-y-4">
                      <div className="grid items-center justify-center gap-y-2">
                        <Clerk.Field name="code" className="space-y-2">
                          <Clerk.Label className="sr-only">Email address</Clerk.Label>
                          <div className="flex justify-center text-center">
                            <Clerk.Input
                              type="otp"
                              className="flex justify-center has-[:disabled]:opacity-50"
                              autoSubmit
                              render={({ value, status }) => {
                                return (
                                  <div
                                    data-status={status}
                                    className={cn(
                                      'relative flex size-10 items-center justify-center border-y border-r border-input text-sm transition-all first:rounded-l-md first:border-l last:rounded-r-md',
                                      {
                                        'z-10 ring-2 ring-ring ring-offset-background':
                                          status === 'cursor' || status === 'selected',
                                      },
                                    )}
                                  >
                                    {value}
                                    {status === 'cursor' && (
                                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                        <div className="animate-caret-blink h-4 w-px bg-foreground duration-1000" />
                                      </div>
                                    )}
                                  </div>
                                )
                              }}
                            />
                          </div>
                          <Clerk.FieldError className="block text-sm text-destructive">
                            {({ code }) => <span>{getErrorMessage(code)}</span>}
                          </Clerk.FieldError>
                        </Clerk.Field>
                        <SignUp.Action
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
                          <Button type="button" variant="link" size="sm">
                            Não recebeu um código? Reenviar
                          </Button>
                        </SignUp.Action>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="grid w-full gap-y-4">
                        <SignUp.Action submit asChild>
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
                        </SignUp.Action>
                      </div>
                    </CardFooter>
                  </Card>
                </SignUp.Strategy>
              </SignUp.Step>
            </>
          )}
        </Clerk.Loading>
      </SignUp.Root>
  )
}