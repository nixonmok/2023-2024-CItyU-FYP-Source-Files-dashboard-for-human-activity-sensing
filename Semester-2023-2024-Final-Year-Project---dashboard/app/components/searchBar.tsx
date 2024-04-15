import { useSearchParams } from "next/navigation";
import { BiSearch } from "react-icons/bi";

interface searchBarProps {
    searchFunction: (searchValue: string) => void
}
export default function SearchBar(searchBarProps: searchBarProps) { //https://nextjs.org/learn/dashboard-app/adding-search-and-pagination
    function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
        searchBarProps.searchFunction(e.target.value);
    }
    return (
        <div className='flex bg-gray-500 justify-center h-16 w-full '>
            <div className=' flex bg-gray-100 m-3 items-center gap-4 rounded-xl px  p-4 w-2/3  focus-within:ring-4 focus:border-blue-400 duration-500'>
                <BiSearch className='block text-2xl text-gray-500' />
                <input placeholder='type name to search' className='flex-1 bg-transparent focus:outline-none text-gray-700' onChange={(e: React.ChangeEvent<HTMLInputElement>) => { handleSearch(e) }} />
            </div>
        </div>

    )
}
