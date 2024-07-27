import { useParams } from 'react-router-dom';

export default function Search() {
  const { searchQuery } = useParams();

  return <div> {searchQuery} </div>;
}
