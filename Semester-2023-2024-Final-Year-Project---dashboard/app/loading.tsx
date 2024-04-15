import { AiOutlineLoading3Quarters} from 'react-icons/ai';

export default function Loading() {
    // You can add any UI inside Loading, including a Skeleton.
    return (
    <div className='flex flex-col h-full w-full gap-y-6 justify-center items-center animate-fade animate-ease-out'>
            <AiOutlineLoading3Quarters className="text-blue-500 animate-spin text-9xl"/>
            <span className='text-xl'>Loading...</span>
    </div>
    )
  }