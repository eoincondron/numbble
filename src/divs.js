import React from "react";


export function NumTile(props) {
    // clicking this will remove any adjacent brackets
    return (
        <div className="num_tile block placed rounded-lg shadow-md flex items-center justify-center" style={props.style} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

//  ==================================== ===



export function Spacer(props) {
    // Add highlighted class if the prop is true
    const className = props.isHighlighted 
        ? "spacer block placed highlightable highlighted" 
        : "spacer block placed highlightable";
        
    return (
        <div className={className} style={props.style} onClick={props.onClick}>
        </div>
    );
}

// ==================================== ===


export function DormantOpTile(props) {
    // Render op tile in the initial state. On click will make it waiting.
    return (
        <button className="op_tile block dormant rounded-md shadow-sm transition-all hover:shadow-md flex items-center justify-center" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// ==================================== ===


export function WaitingOpTile(props) {
    // Render op tile that has been clicked. This will have different style (place and colour) to highlight.
    // Clicking will render dormant.
    return (
        <button className="waiting op_tile block rounded-md shadow-md flex items-center justify-center transform scale-110 transition-all" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// ==================================== ===

export function PlacedOpTile(props) {
    // Render op tile that has been placed. This will have a different position to the dormant op tile.
    // Clicking will move it back to the dormant state.
    return (
        <button className="placed op_tile block rounded-md shadow-lg flex items-center justify-center" style={props.style} onClick={props.onClick}>
            {props.value}
        </button>
    );
}

// ==================================== ===

export function DormantBracketTile(props) {
    return (
        <div className='dormant bracket_tile op_tile block rounded-md shadow-sm transition-all hover:shadow-md flex items-center justify-center' style={props.style} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

// ==================================== ===

export function WaitingBracketTile(props) {
    return (
        <div className='waiting bracket_tile op_tile block rounded-md shadow-md flex items-center justify-center transform scale-110 transition-all' style={props.style} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

// ==================================== ===

export function PlacedBracketTile(props) {
    return (
        <div className='bracket_tile block op_tile placed rounded-md shadow-lg flex items-center justify-center' style={props.style} onClick={props.onClick}>
            {props.value}
        </div>
    );
}

// ==================================== ===

export function ResetTile(props) {
    return (
        <button className="reset_tile rounded-md shadow-md flex items-center justify-center transition-all hover:shadow-lg hover:bg-green-400" style={props.style} onClick={props.onClick}>
            Reset (R)
        </button>
    );
}

//  =================================== ===


export function Equation(props) {
    return (
        <div className="equation rounded-md shadow-md p-2">
            {props.equation}
        </div>
    );
}

//  =================================== ===

export function PlayButton(props) {
    return (
        <div className='play button rounded-md shadow-md flex items-center justify-center font-semibold transition-all hover:shadow-lg hover:bg-red-600' onClick={props.onClick}>
            Check Equation (↵)
        </div>
    );
}

export function BackgroundSelector(props) {
    return (
        <div className='bg-selector'>
            <label htmlFor="bg-select" className="bg-selector-label">Background: </label>
            <select 
                id="bg-select"
                value={props.currentBackground} 
                onChange={(e) => props.onChange(e.target.value)}
                className='bg-selector-dropdown'
            >
                {props.backgrounds.map(bg => (
                    <option key={bg.id} value={bg.class}>
                        {bg.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
