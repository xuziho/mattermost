// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback} from 'react';

import SearchDateSuggestion from 'components/suggestion/search_date_suggestion';
import {hasResults, hasSuggestionWithComponent, type SuggestionResults} from 'components/suggestion/suggestion_results';

import SearchHints from './search_hint';

type Props = {
    searchTerms: string;
    searchTeam: string;
    setSearchTerms: (searchTerms: string) => void;
    searchType: string;
    selectedTerm: string;
    results: SuggestionResults;
    focus: (pos: number) => void;
}

const SearchBoxHints = ({searchTerms, searchTeam, setSearchTerms, searchType, results, selectedTerm, focus}: Props) => {
    const filterSelectedCallback = useCallback((filter: string) => {
        if (searchTerms.endsWith(' ') || searchTerms.length === 0) {
            setSearchTerms(searchTerms + filter);
            focus(searchTerms.length + filter.length);
        } else {
            setSearchTerms(searchTerms + ' ' + filter);
            focus(searchTerms.length + filter.length + 1);
        }
    }, [searchTerms, setSearchTerms, focus]);

    return (
        <SearchHints
            onSelectFilter={filterSelectedCallback}
            searchType={searchType}
            searchTerms={searchTerms}
            searchTeam={searchTeam}
            hasSelectedOption={hasResults(results) && selectedTerm !== ''}
            isDate={hasSuggestionWithComponent(results, SearchDateSuggestion)}
        />
    );
};

export default SearchBoxHints;
