// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React, {useCallback, useEffect, useState} from 'react';
import {useIntl} from 'react-intl';
import AsyncSelect from 'react-select/async';

import type {PropertyField} from '@mattermost/types/properties';
import type {UserProfile} from '@mattermost/types/users';

import './selectable_user_property_renderer.scss';
import type {UserPropertyMetadata} from 'components/properties_card_view/properties_card_view';

type Props = {
    field: PropertyField;
    metadata?: UserPropertyMetadata;
    initialValue?: string;
}

export function SelectableUserPropertyRenderer({field, metadata, initialValue}: Props) {
    const {formatMessage} = useIntl();
    const [value, setValue] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (initialValue) {
            setValue({id: initialValue, username: initialValue} as UserProfile);
        }
    }, [initialValue]);

    const placeholder = (
        <span className='SelectableUserPropertyRenderer_placeholder'>
            <i className='icon icon-account-outline'/>
            {formatMessage({id: 'generic.unassigned', defaultMessage: 'Unassigned'})}
        </span>
    );

    const onSelect = useCallback((user: UserProfile | null) => {
        if (user) {
            metadata?.setUser?.(user.id);
            setValue(user);
        }
    }, [metadata]);

    const loadOptions = useCallback((term: string) => {
        return metadata?.searchUsers?.(term) ?? Promise.resolve([]);
    }, [metadata]);

    return (
        <div
            className='SelectableUserPropertyRenderer'
            data-testid='selectable-user-property'
        >
            <AsyncSelect<UserProfile, false>
                inputId={`selectable-user-property-renderer-${field.id}`}
                className='react-select'
                classNamePrefix='react-select'
                value={value}
                placeholder={placeholder}
                loadOptions={loadOptions}
                getOptionLabel={(user) => user.username}
                getOptionValue={(user) => user.id}
                onChange={onSelect}
                isClearable={true}
            />
        </div>
    );
}
