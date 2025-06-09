// <reference types="cypress" />
// @ts-nocheck
import { addClerkCommands } from '@clerk/testing/cypress';
addClerkCommands({ Cypress, cy });
Cypress.Commands.add('login', () => {
    cy.visit('/fluimap/dashboard');
    cy.get('[data-test="input-email"]').type('matheusgkrebs@gmail.com')
    cy.get('.p-6.grid > .shadow').click()
    cy.get('[data-test="input-password"]').type('endtoendtest')
    cy.get('.flex.items-center > .grid > .text-sm').click()
  });
Cypress.Commands.add('CreateTeam',() => {
    cy.get('[data-test="create-team-button"]')
    
})
Cypress.Commands.add('CreateForm', () => {
    cy.get('[data-test="new-survey"]').click()
    cy.get('[data-test="input-name-survey"]').type('survey-test')

  });
export {};