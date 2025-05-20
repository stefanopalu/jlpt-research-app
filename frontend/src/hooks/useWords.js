import { useQuery } from "@apollo/client";
import { GET_ALL_WORDS } from "../graphql/queries";

const useWords = () => {
    const { data, error, loading } = useQuery(GET_ALL_WORDS, {
        fetchPolicy: 'cache-and-network'
    });
    const words = data?.allWords
    return { words, error, loading };
}

export { useWords };