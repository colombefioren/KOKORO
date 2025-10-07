/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  id?: string;
  name?: string;
  image?: string | null;
  email?: string;
  emailVerified?: boolean;
  isOnline?: boolean | null;
  bio?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  username?: string | null;
  displayUsername?: string | null;
}

export interface Friendship {
  id?: string;
  requesterId?: string;
  receiverId?: string;
  status?: "PENDING" | "ACCEPTED";
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface FriendshipRecord {
  /** @example "fr_12345" */
  id?: string;
  requester?: User;
  receiver?: User;
  /** @example "ACCEPTED" */
  status?: "PENDING" | "ACCEPTED";
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
}

export interface Room {
  /** @example "room_12345" */
  id?: string;
  /** @example "Study Group" */
  name?: string;
  /** @example "PRIVATE" */
  type?: "PUBLIC" | "PRIVATE" | "FRIENDS";
  /** @example "A private space for coding discussions." */
  description?: string | null;
  /** @example "user_6789" */
  createdBy?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  /** @example 10 */
  maxMembers?: number | null;
  /** @example true */
  isActive?: boolean;
  /** @example false */
  isFavorite?: boolean;
  /** @example "chat_12345" */
  chatId?: string | null;
}

export interface RoomMember {
  /** @example "member_001" */
  id?: string;
  /** @example "user_6789" */
  userId?: string;
  /** @example "room_12345" */
  roomId?: string;
  /** @example "HOST" */
  role?: "HOST" | "MEMBER";
  /** @format date-time */
  joinedAt?: string;
  user?: User;
}

export interface Chat {
  /** @example "chat_12345" */
  id?: string;
  /** @example "ROOM" */
  type?: "PRIVATE" | "ROOM";
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  name?: string | null;
  members?: ChatMember[];
  messages?: Message[];
}

export interface ChatMember {
  /** @example "chat_member_001" */
  id?: string;
  /** @example "user_6789" */
  userId?: string;
  /** @example "chat_12345" */
  chatId?: string;
  /** @format date-time */
  joinedAt?: string;
  /** @format date-time */
  deletedAt?: string | null;
  user?: User;
}

export interface Message {
  /** @example "msg_12345" */
  id?: string;
  /** @example "chat_12345" */
  chatId?: string;
  /** @example "user_6789" */
  senderId?: string;
  /** @example "Hello everyone!" */
  content?: string;
  imageUrl?: string | null;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  sender?: User;
}

export interface RoomRecord {
  /** @example "room_12345" */
  id?: string;
  /** @example "Study Group" */
  name?: string;
  /** @example "PRIVATE" */
  type?: "PUBLIC" | "PRIVATE" | "FRIENDS";
  /** @example "A private space for coding discussions." */
  description?: string | null;
  /** @example "user_6789" */
  createdBy?: string;
  /** @format date-time */
  createdAt?: string;
  /** @format date-time */
  updatedAt?: string;
  maxMembers?: number | null;
  isActive?: boolean;
  isFavorite?: boolean;
  chat?: Chat;
  members?: RoomMember[];
}

export interface RoomUpdateInput {
  /** @example "New Room Name" */
  name?: string;
  /** @example "Updated description" */
  description?: string;
  /** @example true */
  isFavorite?: boolean;
  /** @example false */
  isActive?: boolean;
  /** @example 20 */
  maxMembers?: number;
}

export type QueryParamsType = Record<string | number, any>;
export type ResponseFormat = keyof Omit<Body, "body" | "bodyUsed">;

export interface FullRequestParams extends Omit<RequestInit, "body"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat;
  /** request body */
  body?: unknown;
  /** base url */
  baseUrl?: string;
  /** request cancellation token */
  cancelToken?: CancelToken;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string;
  baseApiParams?: Omit<RequestParams, "baseUrl" | "cancelToken" | "signal">;
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<RequestParams | void> | RequestParams | void;
  customFetch?: typeof fetch;
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown>
  extends Response {
  data: D;
  error: E;
}

type CancelToken = Symbol | string | number;

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = "https://kokoro-colombe.vercel.app";
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private abortControllers = new Map<CancelToken, AbortController>();
  private customFetch = (...fetchParams: Parameters<typeof fetch>) =>
    fetch(...fetchParams);

  private baseApiParams: RequestParams = {
    credentials: "same-origin",
    headers: {},
    redirect: "follow",
    referrerPolicy: "no-referrer",
  };

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig);
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key);
    return `${encodedKey}=${encodeURIComponent(typeof value === "number" ? value : `${value}`)}`;
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key]);
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key];
    return value.map((v: any) => this.encodeQueryParam(key, v)).join("&");
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {};
    const keys = Object.keys(query).filter(
      (key) => "undefined" !== typeof query[key],
    );
    return keys
      .map((key) =>
        Array.isArray(query[key])
          ? this.addArrayQueryParam(query, key)
          : this.addQueryParam(query, key),
      )
      .join("&");
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery);
    return queryString ? `?${queryString}` : "";
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.JsonApi]: (input: any) =>
      input !== null && (typeof input === "object" || typeof input === "string")
        ? JSON.stringify(input)
        : input,
    [ContentType.Text]: (input: any) =>
      input !== null && typeof input !== "string"
        ? JSON.stringify(input)
        : input,
    [ContentType.FormData]: (input: any) => {
      if (input instanceof FormData) {
        return input;
      }

      return Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key];
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === "object" && property !== null
              ? JSON.stringify(property)
              : `${property}`,
        );
        return formData;
      }, new FormData());
    },
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input),
  };

  protected mergeRequestParams(
    params1: RequestParams,
    params2?: RequestParams,
  ): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected createAbortSignal = (
    cancelToken: CancelToken,
  ): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken);
      if (abortController) {
        return abortController.signal;
      }
      return void 0;
    }

    const abortController = new AbortController();
    this.abortControllers.set(cancelToken, abortController);
    return abortController.signal;
  };

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken);

    if (abortController) {
      abortController.abort();
      this.abortControllers.delete(cancelToken);
    }
  };

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const queryString = query && this.toQueryString(query);
    const payloadFormatter = this.contentFormatters[type || ContentType.Json];
    const responseFormat = format || requestParams.format;

    return this.customFetch(
      `${baseUrl || this.baseUrl || ""}${path}${queryString ? `?${queryString}` : ""}`,
      {
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type && type !== ContentType.FormData
            ? { "Content-Type": type }
            : {}),
        },
        signal:
          (cancelToken
            ? this.createAbortSignal(cancelToken)
            : requestParams.signal) || null,
        body:
          typeof body === "undefined" || body === null
            ? null
            : payloadFormatter(body),
      },
    ).then(async (response) => {
      const r = response as HttpResponse<T, E>;
      r.data = null as unknown as T;
      r.error = null as unknown as E;

      const responseToParse = responseFormat ? response.clone() : response;
      const data = !responseFormat
        ? r
        : await responseToParse[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data;
              } else {
                r.error = data;
              }
              return r;
            })
            .catch((e) => {
              r.error = e;
              return r;
            });

      if (cancelToken) {
        this.abortControllers.delete(cancelToken);
      }

      if (!response.ok) throw data;
      return data;
    });
  };
}

/**
 * @title Kokoro API
 * @version 1.0.0
 * @baseUrl https://kokoro-colombe.vercel.app
 *
 * Kokoro API powers all core features of the web app including user management, friendships, rooms, and chat.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  bio = {
    /**
     * @description Updates the **bio field** of the currently authenticated user. This endpoint is typically called from the profile settings screen when a user edits their personal description. The new bio is a simple text string that appears on the user's profile and may be visible to others in rooms, chats, or social spaces — depending on privacy settings. Requires a valid BetterAuth session (sent via session cookie) to verify user identity.
     *
     * @name UpdateUserBio
     * @summary Update the current user's bio
     * @request POST:/bio
     * @secure
     */
    updateUserBio: (data: string, params: RequestParams = {}) =>
      this.request<
        {
          /** @example "Bio updated successfully" */
          success?: string;
        },
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to update bio" */
            error?: string;
          }
      >({
        path: `/bio`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  user = {
    /**
     * @description Retrieves the profile of the currently authenticated user.
     *
     * @name GetUser
     * @summary Get the currently authenticated user's profile
     * @request GET:/user
     * @secure
     */
    getUser: (params: RequestParams = {}) =>
      this.request<
        User,
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "User not found" */
            error?: string;
          }
        | {
            /** @example "Failed to get user" */
            error?: string;
          }
      >({
        path: `/user`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  friends = {
    /**
     * @description Retrieves the list of accepted friends for the currently authenticated user.
     *
     * @name GetFriends
     * @summary Get user's friends list
     * @request GET:/friends
     * @secure
     */
    getFriends: (params: RequestParams = {}) =>
      this.request<
        User[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to get friends" */
            error?: string;
          }
      >({
        path: `/friends`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves pending friend requests sent to the current user.
     *
     * @name GetPendingFriendRequests
     * @summary Get pending friend requests
     * @request GET:/friends/requests
     * @secure
     */
    getPendingFriendRequests: (params: RequestParams = {}) =>
      this.request<
        User[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to get pending friend requests" */
            error?: string;
          }
      >({
        path: `/friends/requests`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Send a friend request to another user. Cannot send to yourself and duplicate requests are prevented.
     *
     * @name SendFriendRequest
     * @summary Send a friend request
     * @request POST:/friends/requests
     * @secure
     */
    sendFriendRequest: (
      data: {
        /**
         * ID of the user to send friend request to
         * @example "user_123"
         */
        receiverId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        Friendship,
        | {
            /** @example "You cannot send a friend request to yourself" */
            error?: string;
          }
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to send friend request" */
            error?: string;
          }
      >({
        path: `/friends/requests`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Accept a pending friend request. Only the receiver of the request can accept it.
     *
     * @name AcceptFriendRequest
     * @summary Accept a friend request
     * @request POST:/friends/accept-request
     * @secure
     */
    acceptFriendRequest: (
      data: {
        /**
         * ID of the user who sent the request to accept
         * @example "friend_req_123"
         */
        requesterId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        Friendship,
        | {
            /** @example "friendshipId is required" */
            error?: string;
          }
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Friend request not found or unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to accept friend request" */
            error?: string;
          }
      >({
        path: `/friends/accept-request`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Decline a pending friend request or remove an existing friend.  This permanently deletes the friendship record.
     *
     * @name DeleteFriendship
     * @summary Decline a friend request or remove a friend
     * @request DELETE:/friends/decline-request
     * @secure
     */
    deleteFriendship: (
      data: {
        /**
         * ID of the friend or requester to remove or decline
         * @example "friend_123"
         */
        friendId: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example true */
          success?: boolean;
          /** @example "Friendship removed or request declined" */
          message?: string;
        },
        | {
            /** @example "friendId is required" */
            error?: string;
          }
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Friendship not found" */
            error?: string;
          }
        | {
            /** @example "Failed to remove friend or decline request" */
            error?: string;
          }
      >({
        path: `/friends/decline-request`,
        method: "DELETE",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves **all friendship records** (both pending and accepted) involving the currently authenticated user — whether the user is the requester or receiver. Useful for debugging or for features that need to display the complete friendship state.
     *
     * @name GetFriendshipRecords
     * @summary Get all friendship records
     * @request GET:/friends/record
     * @secure
     */
    getFriendshipRecords: (params: RequestParams = {}) =>
      this.request<
        FriendshipRecord[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to fetch friendships" */
            error?: string;
          }
      >({
        path: `/friends/record`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
     * @description Search for users by name, email, or username. Excludes the current user from results.
     *
     * @name SearchUsers
     * @summary Search users
     * @request GET:/users
     * @secure
     */
    searchUsers: (
      query?: {
        /**
         * Search query to filter users by name, email, or username
         * @example "john"
         */
        q?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        User[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to get users" */
            error?: string;
          }
      >({
        path: `/users`,
        method: "GET",
        query: query,
        secure: true,
        format: "json",
        ...params,
      }),
  };
  rooms = {
    /**
     * @description Retrieves **all rooms**.
     *
     * @name GetAllRooms
     * @summary Get all rooms wether the users is there or not
     * @request GET:/rooms
     * @secure
     */
    getAllRooms: (params: RequestParams = {}) =>
      this.request<
        RoomRecord[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to get rooms" */
            error?: string;
          }
      >({
        path: `/rooms`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Creates a new room with the authenticated user as the host. Automatically creates an associated chat for the room.
     *
     * @name CreateRoom
     * @summary Create a new room
     * @request POST:/rooms
     * @secure
     */
    createRoom: (
      data: {
        /**
         * Name of the room
         * @example "Movie Night"
         */
        name: string;
        /**
         * Room description
         * @example "Watching movies together"
         */
        description?: string;
        /**
         * Room privacy type
         * @example "PUBLIC"
         */
        type: "PUBLIC" | "PRIVATE" | "FRIENDS";
        /**
         * Array of user IDs to add as members
         * @example ["user_123","user_456"]
         */
        memberIds?: string[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        RoomRecord,
        | {
            /** @example "Name and type are required" */
            error?: string;
          }
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to create room" */
            error?: string;
          }
      >({
        path: `/rooms`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves **all rooms** that the currently authenticated user is a member of. Includes room details, chat information, and all members of each room.
     *
     * @name GetUserRooms
     * @summary Get all rooms of the authenticated user
     * @request GET:/rooms/membership
     * @secure
     */
    getUserRooms: (params: RequestParams = {}) =>
      this.request<
        RoomRecord[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to get rooms" */
            error?: string;
          }
      >({
        path: `/rooms/membership`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieve a specific room, including its members and chat, by its unique ID.
     *
     * @name GetRoomById
     * @summary Get a room by ID
     * @request GET:/rooms/{id}
     * @secure
     */
    getRoomById: (id: string, params: RequestParams = {}) =>
      this.request<
        RoomRecord,
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Room not found" */
            error?: string;
          }
        | {
            /** @example "Failed to fetch room" */
            error?: string;
          }
      >({
        path: `/rooms/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Updates the specified **room**. Only the **host (creator)** of the room can update it.
     *
     * @name UpdateRoom
     * @summary Update a room
     * @request PATCH:/rooms/{id}
     * @secure
     */
    updateRoom: (
      id: string,
      data: RoomUpdateInput,
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example true */
          success?: boolean;
        },
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Room not found or you are not the host" */
            error?: string;
          }
        | {
            /** @example "Failed to update room" */
            error?: string;
          }
      >({
        path: `/rooms/${id}`,
        method: "PATCH",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Deletes the specified **room** and all its related data. Only the **host (creator)** of the room can perform this action.
     *
     * @name DeleteRoom
     * @summary Delete a room
     * @request DELETE:/rooms/{id}
     * @secure
     */
    deleteRoom: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /** @example true */
          success?: boolean;
        },
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Room not found or you are not the host" */
            error?: string;
          }
        | {
            /** @example "Failed to delete room" */
            error?: string;
          }
      >({
        path: `/rooms/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Allows a user to leave a room they are a member of. Hosts **cannot** leave the room.
     *
     * @name LeaveRoom
     * @summary Leave a room
     * @request DELETE:/rooms/{id}/leave
     * @secure
     */
    leaveRoom: (id: string, params: RequestParams = {}) =>
      this.request<
        {
          /** @example "You have left the room" */
          message?: string;
        },
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Hosts cannot leave the room" */
            error?: string;
          }
        | {
            /** @example "Failed to leave room" */
            error?: string;
          }
      >({
        path: `/rooms/${id}/leave`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Toggles the `isFavorite` flag for a room **that the authenticated user is a member of**. The user does **not** need to be the host — any member can mark or unmark a room as favorite.
     *
     * @name ToggleRoomFavorite
     * @summary Toggle room favorite status
     * @request PATCH:/rooms/{id}/favorite
     * @secure
     */
    toggleRoomFavorite: (id: string, params: RequestParams = {}) =>
      this.request<
        Room,
        | {
            /** @example "Unauthorized" */
            error?: string;
          }
        | {
            /** @example "You are not a member of this room" */
            error?: string;
          }
        | {
            /** @example "Failed to update favorite status" */
            error?: string;
          }
      >({
        path: `/rooms/${id}/favorite`,
        method: "PATCH",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  chats = {
    /**
     * @description Creates a private or room chat based on the given parameters.
     *
     * @name CreateChat
     * @summary Create a new chat
     * @request POST:/chats
     * @secure
     */
    createChat: (
      data: {
        type: "PRIVATE" | "ROOM";
        memberIds: string[];
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        Chat,
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to create chat" */
            error?: string;
          }
      >({
        path: `/chats`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves all chats where the current user is an active member (not deleted).
     *
     * @name GetUserChats
     * @summary Get all chats for current user
     * @request GET:/chats
     * @secure
     */
    getUserChats: (params: RequestParams = {}) =>
      this.request<
        Chat[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to get chats" */
            error?: string;
          }
      >({
        path: `/chats`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Marks the chat as deleted for the current user (soft delete from chat members).
     *
     * @name SoftDeleteChat
     * @summary Soft delete chat for current user
     * @request DELETE:/chats/{chatId}
     * @secure
     */
    softDeleteChat: (chatId: string, params: RequestParams = {}) =>
      this.request<
        {
          /** @example true */
          success?: boolean;
        },
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Chat not found" */
            error?: string;
          }
        | {
            /** @example "Failed to delete chat" */
            error?: string;
          }
      >({
        path: `/chats/${chatId}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Retrieves all messages from a chat that haven't been deleted for the current user.
     *
     * @name GetChatMessages
     * @summary Get all messages in a chat
     * @request GET:/chats/{chatId}/messages
     * @secure
     */
    getChatMessages: (chatId: string, params: RequestParams = {}) =>
      this.request<
        Message[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Chat not found" */
            error?: string;
          }
        | {
            /** @example "Failed to get messages" */
            error?: string;
          }
      >({
        path: `/chats/${chatId}/messages`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Returns all private (1:1) chats the current user is a member of, excluding chats soft-deleted for that user.
     *
     * @name GetPrivateChats
     * @summary Get all private chats for the current user
     * @request GET:/chats/private
     * @secure
     */
    getPrivateChats: (params: RequestParams = {}) =>
      this.request<
        Chat[],
        | {
            /** @example "unauthorized" */
            error?: string;
          }
        | {
            /** @example "Failed to fetch private chats" */
            error?: string;
          }
      >({
        path: `/chats/private`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
}
