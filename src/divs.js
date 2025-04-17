import React from "react";
import { OP_SCORES } from "./util";


export function NumTile(props) {
    // clicking this will remove any adjacent brackets
    // Add drag and drop handlers for receiving brackets
    const handleDragOver = (event) => {
        // Prevent default to allow drop
        event.preventDefault();
        event.currentTarget.classList.add("drag-over");
    };
    
    const handleDragLeave = (event) => {
        event.currentTarget.classList.remove("drag-over");
    };
    
    const handleDrop = (event) => {
        event.preventDefault();
        // Remove the drag-over class
        event.currentTarget.classList.remove("drag-over");
        
        // Get the bracket that was dragged
        const bracket = event.dataTransfer.getData("text/plain");
        
        // If we have an onDrop handler, call it with the bracket
        if (props.onDrop) {
            props.onDrop(bracket);
        } else {
            // Fallback to the click handler if no drop handler
            props.onClick();
        }
    };
    
    return (
        <div 
            className="num_tile block placed rounded-lg shadow-md flex items-center justify-center" 
            style={props.style} 
            onClick={props.onClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {props.value}
        </div>
    );
}

//  ==================================== ===



export function Spacer(props) {
    // Add highlighted class if the prop is true 
    const className = props.isHighlighted && props.isActive
        ? "spacer block placed highlightable highlighted" 
        : "spacer block placed highlightable";
    
    // Drag and drop handlers
    const handleDragOver = (event) => {
        // Prevent default to allow drop
        event.preventDefault();
        event.currentTarget.classList.add("drag-over");
    };
    
    const handleDragLeave = (event) => {
        event.currentTarget.classList.remove("drag-over");
    };
    
    const handleDrop = (event) => {
        event.preventDefault();
        // Remove the drag-over class
        event.currentTarget.classList.remove("drag-over");
        
        // Get the operator that was dragged
        const operator = event.dataTransfer.getData("text/plain");
        
        // If we have an onDrop handler, call it with the operator
        if (props.onDrop) {
            props.onDrop(operator);
        } else {
            // Fallback to the click handler if no drop handler
            props.onClick();
        }
    };
        
    return (
        <div 
            className={className} 
            style={props.style} 
            onClick={props.onClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
        </div>
    );
}

// ==================================== ===


export function DormantOpTile(props) {
    // Render op tile in the initial state. On click will make it waiting.
    // Add drag and drop functionality
    const handleDragStart = (event) => {
        // Set the operator value as the data being dragged
        event.dataTransfer.setData("text/plain", props.value);
        // Add a class for drag styling
        event.currentTarget.classList.add("dragging");
    };
    
    const handleDragEnd = (event) => {
        // Remove the dragging class
        event.currentTarget.classList.remove("dragging");
    };
    
    // Get the score for this operator
    const score = OP_SCORES[props.value] !== undefined ? OP_SCORES[props.value] : 0;
    
    return (
        <button 
            className="op_tile block dormant rounded-md shadow-sm transition-all hover:shadow-md flex items-center justify-center relative"
            style={props.style} 
            onClick={props.onClick}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {props.value}
            {score > 0 && <span className="score">{score}</span>}
        </button>
    );
}

// ==================================== ===


export function WaitingOpTile(props) {
    // Render op tile that has been clicked. This will have different style (place and colour) to highlight.
    // Clicking will render dormant.
    
    // Get the score for this operator
    const score = OP_SCORES[props.value] !== undefined ? OP_SCORES[props.value] : 0;
    
    return (
        <button className="waiting op_tile block rounded-md shadow-md flex items-center justify-center transform scale-110 transition-all relative" style={props.style} onClick={props.onClick}>
            {props.value}
            {score > 0 && <span className="score">{score}</span>}
        </button>
    );
}

// ==================================== ===

export function PlacedOpTile(props) {
    // Render op tile that has been placed. This will have a different position to the dormant op tile.
    // Clicking will move it back to the dormant state.
    
    // Get the score for this operator
    const score = OP_SCORES[props.value] !== undefined ? OP_SCORES[props.value] : 0;
    
    return (
        <button className="placed op_tile block rounded-md shadow-lg flex items-center justify-center relative"
                style={props.style}
                onClick={props.onClick}>
            {props.value}
            {score > 0 && <span className="score">{score}</span>}
        </button>
    );
}

// ==================================== ===

export function DormantBracketTile(props) {
    // Add drag and drop functionality for brackets
    const handleDragStart = (event) => {
        // Set the bracket value as the data being dragged
        event.dataTransfer.setData("text/plain", props.value);
        // Add a class for drag styling
        event.currentTarget.classList.add("dragging");
    };
    
    const handleDragEnd = (event) => {
        // Remove the dragging class
        event.currentTarget.classList.remove("dragging");
    };
    
    return (
        <div 
            className='dormant bracket_tile op_tile block rounded-md shadow-sm transition-all hover:shadow-md flex items-center justify-center' 
            style={props.style} 
            onClick={props.onClick}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            {props.value}
        </div>
    );
}

// ==================================== ===

export function WaitingBracketTile(props) {
    // Add drag and drop functionality for brackets in waiting state
    const handleDragStart = (event) => {
        // Set the bracket value as the data being dragged
        event.dataTransfer.setData("text/plain", props.value);
        // Add a class for drag styling
        event.currentTarget.classList.add("dragging");
    };
    
    const handleDragEnd = (event) => {
        // Remove the dragging class
        event.currentTarget.classList.remove("dragging");
    };
    
    return (
        <div 
            className='waiting bracket_tile op_tile block rounded-md shadow-md flex items-center justify-center transform scale-110 transition-all' 
            style={props.style} 
            onClick={props.onClick}
            draggable="true"
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
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
