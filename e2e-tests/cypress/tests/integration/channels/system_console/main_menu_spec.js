// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

// ***************************************************************
// - [#] indicates a test step (e.g. # Go to a page)
// - [*] indicates an assertion (e.g. * Check the title)
// - Use element ID when selecting an element. Create one if none.
// ***************************************************************

// Stage: @prod
// Group: @channels @system_console

describe('Main menu', () => {
    before(() => {
        cy.visit('/admin_console');

        // # Open the hamburger menu
        cy.get('button > span[class="menu-icon"]').click();
    });

    it('MM-T909 Can switch to team', () => {
        // * Verify teams are visible
        cy.findByText('Switch to eligendi').should('be.visible');
    });

    it('MM-T914 Can log out from system console', () => {
        // * Verify log out button is visible
        cy.findByText('Log Out').should('be.visible');
    });

});
