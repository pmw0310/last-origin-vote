/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApolloQueryResult } from '@apollo/client';
import { atom } from 'recoil';

export const refetch = atom<
    | ((
          variables?: Partial<Record<string, any>> | undefined,
      ) => Promise<ApolloQueryResult<any>>)
    | undefined
>({
    key: 'list/refetch',
    default: undefined,
});
