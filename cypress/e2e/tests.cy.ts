// @ts-nocheck
import { setupClerkTestingToken } from '@clerk/testing/cypress';
describe('Sign in flow com Clerk', () => {
  it('sign in sucess', () => {
    cy.login()
  });
});
describe.only('Tela Times', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/fluimap/teams')
  });
  it('create Team sucess', () => {
    
  });
});
describe.only('Tela formularios', () => {
  beforeEach(() => {
    cy.login()
    cy.visit('/fluimap/surveys')
  });
  it('sign in sucess', () => {
    
  });
});
