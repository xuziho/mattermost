// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';
import styled from 'styled-components';

import {SuggestionListStatus} from 'components/suggestion/suggestion_list';
import SuggestionListContents from 'components/suggestion/suggestion_list_contents';
import type {SuggestionResults} from 'components/suggestion/suggestion_results';
import {hasResults} from 'components/suggestion/suggestion_results';

const SuggestionsBody = styled.div`
    border-bottom: 1px solid rgba(var(--center-channel-color-rgb), 0.08);
    padding-bottom: 16px;

    .suggestion-list__divider {
        margin-top: 16px;
        padding: 8px 24px;
    }

    ul[role="group"], ul[role="listbox"] {
        // Undo padding and margins added by Bootstrap and our design system
        padding: 0;
        margin: 0;
    }
`;

type Props = {
    id: string;
    searchType: string;
    searchTeam: string;
    searchTerms: string;
    selectedTerm: string;
    setSelectedTerm: (newSelectedTerm: string) => void;
    results: SuggestionResults;
    onSearch: (searchType: string, searchTeam: string, searchTerms: string) => void;
    onSuggestionSelected: (value: string, matchedPretext: string) => void;
}

const SearchSuggestions = ({
    id,
    results,
    selectedTerm,
    setSelectedTerm,
    onSuggestionSelected,
}: Props) => {
    const getItemId = useCallback((term: string) => `searchBoxSuggestions_item_${term}`, []);

    if (!hasResults(results)) {
        return null;
    }

    return (
        <SuggestionsBody>
            <SuggestionListContents
                id={id}

                results={results}
                selectedTerm={selectedTerm}

                getItemId={getItemId}
                onItemClick={onSuggestionSelected}
                onItemHover={setSelectedTerm}
            />
            <SuggestionListStatus results={results}/>
        </SuggestionsBody>
    );
};

export default SearchSuggestions;

