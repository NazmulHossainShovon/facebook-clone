import { useParams } from 'react-router-dom';
import { useSearchUsers } from '../Hooks/userHook';

export default function Search() {
  const { searchQuery } = useParams();
  const { data } = useSearchUsers(searchQuery);
  console.log(data);

  return <div> Search Result</div>;
}
