export const extractHashtags = (content) => {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return [];
    
    return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
};