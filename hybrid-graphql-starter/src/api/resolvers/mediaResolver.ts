import {MediaItem, TokenContent} from '@sharedTypes/DBTypes';
import {
  fetchAllMedia,
  fetchMediaById,
  fetchMediaByTag,
  postMedia,
  postTagToMedia,
  putMedia,
  deleteMedia,
} from '../models/mediaModel';
import {MyContext} from '../../local-types';
import {GraphQLError} from 'graphql';

export default {
  Query: {
    mediaItems: async () => {
      return await fetchAllMedia();
    },
    mediaItem: async (_parent: undefined, args: {media_id: string}) => {
      const id = Number(args.media_id);
      return await fetchMediaById(id);
    },
    mediaItemsByTag: async (_parent: undefined, args: {tag: string}) => {
      return await fetchMediaByTag(args.tag);
    },
  },
  Mutation: {
    createMediaItem: async (
      _parent: undefined,
      args: {
        input: Omit<
          MediaItem,
          'media_id' | 'created_at' | 'thumbnail' | 'user_id'
        >;
      },
      context: MyContext,
    ) => {
      if (!context.user || !context.user.user_id) {
        throw new GraphQLError('Not authorized', {
          extensions: {code: 'NOT_AUTHORIZED'},
        });
      }
      const userData = {
        ...args.input,
        user_id: context.user.user_id,
      };

      return postMedia(userData);
    },
    addTagToMediaItem: async (
      _parent: undefined,
      args: {input: {media_id: string; tag_name: string}},
    ) => {
      return await postTagToMedia(
        args.input.tag_name,
        Number(args.input.media_id),
      );
    },
    updateMediaItem: async (
      _parent: undefined,
      args: {input: Pick<MediaItem, 'title' | 'description'>; media_id: string},
    ) => {
      return await putMedia(args.input, Number(args.media_id));
    },
    deleteMedia: async (
      _parent: undefined,
      args: {input: {id: number; user: TokenContent; token: string}},
    ) => {
      return await deleteMedia(
        Number(args.input.id),
        args.input.user,
        args.input.token,
      );
    },
  },
};
