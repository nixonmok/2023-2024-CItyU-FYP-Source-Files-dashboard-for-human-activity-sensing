

interface buttonProps{
    name: string,
    imageSrc: string,
    parametersJSX:  JSX.Element,
    onClick: (name: string) => void
}
export default function VisualizationOption(buttonProps: buttonProps) {
    
    return (
        <button className="flex flex-col mb-5 w-full h-[45%] md:h-[60%] shadow-md rounded-xl bg-slate-50 hover:bg-slate-100 overflow-hidden transition"
            onClick={()=>{buttonProps.onClick(buttonProps.name)}}>
            <div className="text-lg font-bold text-center text-blue-600 self-center">{buttonProps.name}</div>
            <div id="parameter and demo image" className='flex-grow grid grid-cols-2 justify-stretch items-stretch mt-1'>
                {buttonProps.parametersJSX}
                <div className=" mr-2">
                    <img src={buttonProps.imageSrc}></img>
                </div>
            </div>
        </button>
    )
}