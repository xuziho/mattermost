// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';

import {renderWithContext, screen} from 'tests/react_testing_utils';

import AtPlanMention from './index';

describe('components/AtPlanMention', () => {
    it('renders the plan mention as plain text', () => {
        renderWithContext(<AtPlanMention plan='Enterprise plan'/>);

        const mention = screen.getByText('Enterprise plan');
        expect(mention.tagName).toBe('SPAN');
        expect(mention).toHaveAttribute('id', 'at_plan_mention');
    });
});
