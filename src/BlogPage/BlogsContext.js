import { createContext, useContext } from 'react';

export const BlogsContext = createContext(null);

export function useBlogs() {
    const context = useContext(BlogsContext);
    if (!context) throw new Error('useBlogs must be used inside BlogsContextProvider.');
    return context;
}

