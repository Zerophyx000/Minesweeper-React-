import { useState } from 'react'
export default function Button()
{
    const [flagged,setFlag] = useState(false)
    return (
        <button 
            style={{aspectRatio : "1/1" }}
            key={`${r}-${c}`}
            onMouseDown={handleClick}
            onContextMenu={(e) => e.preventDefault()}
        >
            {flagged ? <img src={flag}/> : "None"}
        </button>
    )
}