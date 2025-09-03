export const DISPLAY_SETTINGS = {
  COMMENT_SCROLL_HEIGHT: 400,
  GAMES_PER_ROW: {
    MOBILE: 2,
    TABLET: 4,
    DESKTOP: 5
  },
  DEFAULT_LIKE_COUNT: 0
} as const;

export const BREAKPOINTS = {
  MOBILE: 'grid-cols-2',
  TABLET: 'md:grid-cols-4', 
  DESKTOP: 'lg:grid-cols-5'
} as const;

export const STYLES = {
  CONTAINER: {
    className: "space-y-8"
  },
  CARD: {
    className: "bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10"
  },
  HEADER: {
    TITLE: {
      className: "text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60"
    },
    CREATOR_LINK: {
      className: "group"
    },
    CREATOR_AVATAR: {
      className: "group-hover:ring-2 ring-purple-500 transition-all"
    },
    CREATOR_TEXT: {
      className: "text-sm text-gray-400 group-hover:text-white transition-colors"
    },
    UPDATE_TEXT: {
      className: "text-sm text-gray-400"
    }
  },
  ACTIONS: {
    CONTAINER: {
      className: "flex gap-2"
    },
    LIKE_BUTTON: {
      base: "transition-all",
      liked: "bg-purple-500 text-white hover:bg-purple-600"
    }
  },
  GAMES: {
    GRID: {
      className: `grid ${BREAKPOINTS.MOBILE} ${BREAKPOINTS.TABLET} ${BREAKPOINTS.DESKTOP} gap-4`
    },
    CARD: {
      className: "bg-white/5 rounded-lg overflow-hidden group"
    },
    IMAGE_CONTAINER: {
      className: "relative aspect-[3/4]"
    },
    IMAGE: {
      className: "object-cover transition-transform group-hover:scale-110"
    },
    PLACEHOLDER: {
      className: "absolute inset-0 bg-white/5 flex items-center justify-center"
    },
    INFO: {
      className: "p-4"
    },
    TITLE: {
      className: "font-medium text-white line-clamp-2"
    },
    DATE: {
      className: "text-sm text-gray-400 mt-1"
    }
  },
  COMMENTS: {
    HEADER: {
      className: "text-xl font-bold flex items-center gap-2 mb-6"
    },
    COUNT: {
      className: "text-sm text-gray-400"
    },
    INPUT_CONTAINER: {
      className: "flex gap-4 mb-8"
    },
    INPUT_WRAPPER: {
      className: "flex-1 space-y-2"
    },
    INPUT: {
      className: "bg-white/5"
    },
    AUTH_PROMPT: {
      className: "text-center p-4 bg-white/5 rounded-lg mb-8"
    },
    AUTH_LINK: {
      className: "text-purple-400 hover:underline"
    },
    SCROLL_AREA: {
      className: "pr-4"
    },
    COMMENT_CONTAINER: {
      className: "flex gap-4"
    },
    COMMENT_CONTENT: {
      className: "flex-1"
    },
    COMMENT_HEADER: {
      className: "flex items-center gap-2"
    },
    COMMENT_USERNAME: {
      className: "font-medium"
    },
    COMMENT_DATE: {
      className: "text-sm text-gray-400"
    },
    COMMENT_TEXT: {
      className: "mt-1 text-gray-300"
    }
  },
  EMPTY_STATES: {
    CONTAINER: {
      className: "text-center py-12"
    },
    ICON_WRAPPER: {
      className: "inline-block p-3 rounded-full bg-white/5 mb-4"
    },
    ICON: {
      className: "w-6 h-6 text-gray-400"
    },
    TITLE: {
      className: "text-lg font-medium text-white mb-2"
    },
    DESCRIPTION: {
      className: "text-gray-400 text-sm"
    }
  },
  SKELETON: {
    CONTAINER: {
      className: "space-y-8 animate-pulse"
    },
    HEADER: {
      className: "bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 space-y-6"
    },
    HEADER_CONTAINER: {
      className: "space-y-4"
    },
    TITLE: {
      className: "h-12 w-2/3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-lg"
    },
    META_CONTAINER: {
      className: "flex gap-4 items-center"
    },
    AVATAR: {
      className: "h-12 w-12 rounded-full bg-gradient-to-r from-gray-700/50 to-gray-600/50"
    },
    META_TEXT: {
      className: "h-5 w-48 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
    },
    META_TEXT_SMALL: {
      className: "h-4 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
    },
    ACTIONS: {
      className: "flex gap-2"
    },
    ACTION_BUTTON: {
      className: "h-9 w-20 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md"
    },
    GAMES_SECTION: {
      className: "bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 space-y-4"
    },
    GAMES_TITLE: {
      className: "h-7 w-48 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
    },
    GAMES_GRID: {
      className: `grid ${BREAKPOINTS.MOBILE} ${BREAKPOINTS.TABLET} ${BREAKPOINTS.DESKTOP} gap-4`
    },
    GAME_CARD: {
      className: "bg-white/5 rounded-lg overflow-hidden space-y-3 p-3"
    },
    GAME_IMAGE: {
      className: "aspect-[3/4] bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md"
    },
    GAME_TITLE: {
      className: "h-5 w-full bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
    },
    GAME_META: {
      className: "h-4 w-2/3 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
    },
    COMMENTS_SECTION: {
      className: "bg-white/5 rounded-xl p-6 backdrop-blur-sm border border-white/10 space-y-6"
    },
    COMMENTS_HEADER: {
      className: "flex items-center gap-2"
    },
    COMMENTS_TITLE: {
      className: "h-7 w-32 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded"
    },
    COMMENT_INPUT: {
      className: "flex gap-4 items-start"
    },
    COMMENT_INPUT_FIELD: {
      className: "flex-1 h-10 bg-gradient-to-r from-gray-700/50 to-gray-600/50 rounded-md"
    }
  }
} as const;

export const MESSAGES = {
  ERRORS: {
    FETCH_COMMENTS: 'Error fetching comments',
    SUBMIT_COMMENT: 'Error submitting comment',
    LIST_NOT_FOUND: 'List not found',
    GENERIC: 'Something went wrong'
  },
  SUCCESS: {
    LINK_COPIED: 'Link copied to clipboard',
    COMMENT_POSTED: 'Comment posted successfully'
  },
  PLACEHOLDERS: {
    COMMENT_INPUT: 'Add a comment...',
    NO_COVER: 'No Cover',
    FALLBACK_DATE: 'Recently'
  },
  EMPTY_STATES: {
    NO_GAMES: {
      TITLE: 'No games yet',
      DESCRIPTION: 'This list is empty. Games added to this list will appear here.'
    },
    NO_COMMENTS: {
      TITLE: 'No comments yet', 
      DESCRIPTION: 'Be the first to share your thoughts about this list!'
    }
  },
  ACTIONS: {
    SHARE: 'Share',
    POST_COMMENT: 'Post Comment',
    SIGN_IN: 'sign in',
    AUTH_PROMPT: 'to leave a comment'
  },
  SHARE: {
    TITLE_SUFFIX: ' - Game List',
    DESCRIPTION: 'Share this list with your friends!'
  },
  SECTIONS: {
    GAMES: 'Games in this list',
    COMMENTS: 'Comments'
  }
} as const;

export const ICONS = {
  HEART: {
    size: "w-4 h-4 mr-2",
    filled: "fill-current"
  },
  SHARE: {
    size: "w-4 h-4 mr-2"
  },
  MESSAGE_CIRCLE: {
    size: "w-5 h-5"
  },
  GAMEPAD: {
    size: "w-6 h-6"
  }
} as const;

export const ANIMATIONS = {
  SKELETON: {
    className: "animate-pulse"
  },
  HOVER_SCALE: {
    className: "transition-transform group-hover:scale-110"
  },
  FADE_IN: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, ease: "easeOut" }
  },
  STAGGER_CHILDREN: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  },
  LOADING_SHIMMER: {
    className: "animate-pulse bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50 bg-[length:200%_100%] animate-shimmer"
  }
} as const;

export const IMAGE_SETTINGS = {
  GAME_COVER: {
    ASPECT_RATIO: "aspect-[3/4]",
    SIZES: "(max-width: 768px) 50vw, 25vw"
  }
} as const;

export const SCROLL_SETTINGS = {
  COMMENTS_HEIGHT: `h-[${DISPLAY_SETTINGS.COMMENT_SCROLL_HEIGHT}px]`
} as const;