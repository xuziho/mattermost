// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {useMemo} from 'react';
import {useDispatch} from 'react-redux';

import {openModal, closeModal} from 'actions/views/modals';

import type {ModalData} from 'types/actions';

export interface ControlModal {
    open: () => void;
    close: () => void;
}

export function useControlModal<T>(modalData: ModalData<T>): ControlModal {
    const dispatch = useDispatch();
    return useMemo(() => ({
        open: () => {
            dispatch(openModal(modalData));
        },
        close: () => {
            dispatch(closeModal(modalData.modalId));
        },
    }), [modalData, dispatch]);
}
