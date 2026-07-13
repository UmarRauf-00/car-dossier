import { type Dispatch, type SetStateAction } from "react";

type Props = {
  searchTerm: string | undefined;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const DisplayAllCarsByVIN = ({ searchTerm, setLoading }: Props) => {
  console.log("%c⧭", "color: #007300", { searchTerm, setLoading });
  //   useEffect(() => {
  //   setLoading(loading);
  // }, [loading, data]);

  return <div>DisplayAllCarsByVIN</div>;
};

export default DisplayAllCarsByVIN;
