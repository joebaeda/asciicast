import Pokemon from "./pokemon"

const Loading = () => {
    return (
        <div className="fixed inset-0 flex flex-col space-y-3 items-center justify-center z-10 bg-[#17101f]">
            <Pokemon className="w-48 h-48 animate-bounce" />
        </div>
    )
}

export default Loading