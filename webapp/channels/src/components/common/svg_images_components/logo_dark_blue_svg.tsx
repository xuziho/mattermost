// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import styled from 'styled-components';

type Props = {
    width?: number;
    height?: number;
    className?: string;
}

const Svg = styled.svg.attrs({
    version: '1.1',
    xmlns: 'http://www.w3.org/2000/svg',
    xmlnsXlink: 'http://www.w3.org/1999/xlink',
})``;

export default (props: Props) => (
    <Svg
        className={props.className}
        width={props.width ? props.width.toString() : '168'}
        height={props.height ? props.height.toString() : '30'}
        viewBox='0 0 168 30'
        fill='none'
        xmlns='http://www.w3.org/2000/svg'
        role='img'
        aria-label='TinyOffice'
    >
        <rect
            x='1'
            y='2'
            width='26'
            height='26'
            rx='7'
            fill='#F5F7FA'
        />
        <path
            d='M7.4 21.5L12 9.8C12.4 8.8 13.2 8.3 14.2 8.3C15.2 8.3 16 8.8 16.4 9.8L21 21.5H17.6L16.7 19H11.5L10.6 21.5H7.4ZM12.4 16.4H15.8L14.1 11.8L12.4 16.4Z'
            fill='#0D1117'
        />
        <path
            d='M22.2 8H24.4V22H22.2V8Z'
            fill='#50BC9B'
        />
        <text
            x='36'
            y='20.5'
            fill='currentColor'
            fontFamily='-apple-system, BlinkMacSystemFont, Segoe UI, sans-serif'
            fontSize='16'
            fontWeight='760'
            letterSpacing='0'
        >
            TinyOffice
        </text>
    </Svg>
);
