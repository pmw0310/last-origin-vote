import { atom, selector } from 'recoil';

import axios from 'axios';
import { gql } from '@apollo/client';

const REMOVE = gql`
    mutation removeCharacter($id: ID!) {
        removeCharacter(id: $id)
    }
`;

export const removeId = atom<string>({
    key: 'removeId',
    default: '',
});

export const remove = selector<boolean>({
    key: 'remove',
    get: async ({ get }) => {
        try {
            await axios({
                url: '/graphql',
                method: 'POST',
                data: {
                    query: REMOVE,
                    variables: get(removeId),
                },
            });

            return true;
        } catch (e) {
            return false;
        }
    },
});
