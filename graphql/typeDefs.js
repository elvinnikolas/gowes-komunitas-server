const { gql } = require('apollo-server')

module.exports = gql`
    # TYPE
    type Post {
        _id: ID!
        user: User!
        community: Community!
        title: String!
        date: String!
        content: String!
        images: [String]
        likes: [Like]!
        dislikes: [Dislike]!
        comments: [Comment]!
        bookmarks: [Bookmark]!
    }

    type Like {
        _id: ID!
        user: ID!
    }

    type Dislike {
        _id: ID!
        user: ID!
    }

    type Bookmark {
        _id: ID!
        user: ID!
        date: String!
    }

    type Comment {
        _id: ID!
        user: User!
        date: String!
        comment: String!
    }

    type User {
        _id: ID!
        name: String
        username: String
        bio: String
        email: String!
        password: String!
        image: String
        date: String!
        isAdmin: Boolean
        token: String!
    }

    type Community {
        _id: ID!
        name: String!
        bio: String!
        date: String!
        city: String!
        province: String!
        image: String!
        isPrivate: Boolean!
        isActive: Boolean!
        memberCount: Int!
    }

    type Member {
        _id: ID!
        community: Community!
        user: User!
        date: String!
        message: String
        isAdmin: Boolean!
        isJoin: Boolean!
        isRequest: Boolean!
    }

    type CommunityAndMemberStatus {
        _id: ID!
        name: String!
        bio: String!
        date: String!
        city: String!
        province: String!
        image: String!
        isPrivate: Boolean!
        isActive: Boolean!
        memberCount: Int!
        isAdmin: Boolean!
        isJoin: Boolean!
        isRequest: Boolean!
    }

    type Faq {
        _id: ID!
        category: String!
        contents: [Content]
    }

    type Content {
        _id: ID!
        image: String
        question: String!
        answer: String!
    }

    type Status {
        _id: ID!
        user: ID!
        read: Boolean!
    }

    type Chat {
        _id: ID!
        users: [User]!
        lastMessage: String!,
        sent: String!,
        status: [Status]!
    }

    type Message {
        _id: ID!
        chat: ID!
        from: ID!
        to: ID!
        content: String!
        sent: String!
    }

    type Notification {
        _id: ID!
        community: Community
        user: User!
        content: String!
        date: String!
    }

    # INPUT
    input RegisterInput {
        name: String!
        email: String!
        password: String!
    }

    input ProfileInput {
        name: String!
        bio: String!
        image: String!
    }

    input CommunityInput {
        name: String!
        bio: String!
        city: String!
        province: String!
        image: String!
        isPrivate: Boolean!
    }

    input ImageInput {
        url: String!
    }

    # QUERY
    type Query {
        # post
        getPosts: [Post]
        getPost(postId: ID!): Post
        getBookmarkPosts(filter: String): [Post]
        getUserCommunityPosts(communityId: ID!, filter: String!): [Post]
        getUserCommunitiesPosts(filter: String): [Post]
        getExplorePosts(filter: String): [Post]

        # user
        getUser(id: ID!): User
        getUserPosts(id: ID!): [Post]

        # community
        getCommunities: [Community]
        getApproveCommunities: [Community]
        getFilterCommunities(filter: String, location: String, sort: String): [Community]
        getCommunity(communityId: ID!): Community
        getCommunityPosts(communityId: ID!): [Post]
        getCommunityMembers(communityId: ID!): [Member]
        getCommunityMemberRequests(communityId: ID!): [Member]
        getUserCommunities(userId: ID!): [Member]
        getCommunityAndMemberStatus(userId: ID!, communityId: ID!): CommunityAndMemberStatus
        getMemberStatus(userId: ID!, communityId: ID!): Member

        # faq
        getFaqs: [Faq]

        #chat
        getChats: [Chat]

        #message
        getMessages(chatId: ID!): [Message]

        #notification
        getNotifications(id: ID!): [Notification]
    }

    # MUTATION
    type Mutation {
        # user
        register(
            registerInput: RegisterInput
        ) : User!

        login(
            email: String!, 
            password: String!
        ) : User!

        editProfile(
            profileInput: ProfileInput
        ) : User!

        # post
        createPost(
            title: String!,
            content: String!,
            communityId: ID!,
            images: [String]
        ) : Post!

        deletePost(
            postId: ID!
        ) : String!

        addComment(
            postId: ID!,
            comment: String!
        ) : Post!

        deleteComment(
            postId: ID!
            commentId: ID!
        ) : Post!

        likePost(
            postId: ID!
        ) : Post!

        dislikePost(
            postId: ID!
        ) : Post!
        
        bookmarkPost(
            postId: ID!
        ) : Post!

        # community
        createCommunity(
            communityInput: CommunityInput
        ) : Community

        approveCommunity(
            communityId: ID!
        ) : String

        disapproveCommunity(
            communityId: ID!
        ) : String

        requestJoinCommunity(
            communityId: ID!
            message: String
        ) : Member!

        joinCommunity(
            communityId: ID!
        ) : Member!

        leaveCommunity(
            communityId: ID!
        ) : String!

        acceptMember(
            communityId: ID!
            userId: ID!
        ) : Member!

        rejectMember(
            communityId: ID!
            userId: ID!
        ) : String!

        removeMember(
            communityId: ID!
            userId: ID!
        ) : String!

        appointAdmin(
            communityId: ID!
            userId: ID!
        ) : Member!

        deleteCommunityPost(
            postId: ID!
        ) : String!

        #faq
        addFaq(
            category: String!
            image: String
            question: String!
            answer: String!
        ) : Faq

        addFaqCategory(
            category: String!
        ) : Faq

        removeFaq(
            category: String!
        ) : String!

        #message
        sendMessage(
            chatId: ID! 
            to: ID!
            content: String!
        ): Message

        #chat
        newChat(
            to: ID!
        ): Chat
    }

    #SUBSCRIPTION
    type Subscription {
        newMessage: Message!
    }
`