"use client";
import { useState, useEffect, useRef } from 'react';
import { Parser } from 'expr-eval';


const TagInput = () => {
  const p = new Parser();

  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [editValue, setEditValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [editingIndex, setEditingIndex] = useState(-1);
  const [addingIndex, setAddingIndex] = useState(-1);
  const [addingValue, setAddingValue] = useState('');
  const evaluateExpression = (expression) => {
    console.log(expression)
    try {
      const ast = p.parse(expression);
      const evaluatedResult = ast.evaluate();
      return evaluatedResult;
    } catch (error) {
      
      return expression ? 'Error: Invalid expression': '0'
    }
  };

  const addInputRef = useRef(null);
  const editRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const suggestionsList = [
      { name: 'Tag1', value: 10, description: 'Tag 1 description', type: 'value' },
      { name: 'Tag2', value: 20, description: 'Tag 2 description', type: 'value' },
      { name: 'Tag3', value: 1, description: 'Tag 3 description', type: 'value' },
      { name: 'Tag4', value: 15, description: 'Tag 4 description', type: 'value' },
      { name: 'Tag5', value: 5, description: 'Tag 5 description', type: 'value' },
    ];

    const filteredSuggestions = suggestionsList.filter((tag) =>
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
    );
    
    setSuggestions(filteredSuggestions);
  }, [inputValue]);

  useEffect(() => {
    if (editingIndex !== -1 || editRef.current) {
      editRef.current?.focus();
    }
  }, [editingIndex]);

  const handleInputChange = (e) => {
    if (editingIndex === -1 && addingIndex === -1) {
      ref.current.focus();
    }
    const value = e.target.value;
    setInputValue(value);
    const trimmed = value.trim();
    if (/[(+\-*\/)]/.test(trimmed)) {
      // Add the operand as a separate tag
      handleTagAdd({ name: trimmed, value: trimmed, type: 'operand' });
    }
  };

  const handleEditInputChange = (e) => {
    const value = e.target.value;
    setEditValue(value);
  };

  const handleAddingInputChange = (e) => {
    const value = e.target.value;
    setAddingValue(value);
    const trimmed = value.trim();
    if (/[(+\-*\/)]/.test(trimmed)) {
      // Add the operand as a separate tag
      handleTagAdd({ name: trimmed, value: trimmed, type: 'operand' });
    }
  };

  const handleTagAdd = (tag) => {
    if (tag.name.trim() !== '') {
      if (editingIndex >= 0) {
        // Replace the edited tag
        const updatedTags = [...tags];
        updatedTags[editingIndex] = tag;
        setTags(updatedTags);
        setEditingIndex(-1);
      } else {
        const updatedTags = [...tags];
        if (addingIndex !== -1) {
          updatedTags.splice(addingIndex, 0, tag);
          setAddingIndex(addingIndex + 1);
          setAddingValue('');
        } else {
          updatedTags.push(tag);
        }
        setTags(updatedTags);
        setInputValue('');
        ref.current.focus();
      }
      setInputValue('');
      setEditValue('');
    }
  };

  const handleTagClick = (index) => {
    setEditingIndex(index);
    setEditValue(tags[index].name);
  };

  const handleDelete = (index) => {
    setEditingIndex(-1);
    setAddingIndex(-1);
    setEditValue('');
    setAddingValue('');
    const updatedTags = tags.filter((tag, ind) => ind !== index);
    setTags(updatedTags);
  };

  const handleKeyPress = (e) => {
    let value = inputValue;
    if (addingValue) {
      value = addingValue;
    }
    if (e.key === 'Backspace' && tags.length > 0 && addingIndex !== -1 && !value) {
      const updatedTags = [...tags];
      updatedTags.splice(addingIndex - 1, 1);
      setAddingIndex(addingIndex - 1);
      setTags(updatedTags);
    } else if (e.key === 'Backspace' && !value && tags.length > 0) {
      const updatedTags = [...tags];
      if (addingIndex !== -1) {
        if (addingValue) {
          updatedTags.splice(addingIndex + 1, 0, addingValue);
        }
      } else {
        updatedTags.pop();
      }
      setTags(updatedTags);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleTagAdd({ name: value, type: 'value', value: 1 });
    }
  };

  const handleEditKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const editItem = tags[editingIndex];
      editItem.name = editValue;
      handleTagAdd(editItem);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleTagAdd(suggestion);
  };

  console.log({addingIndex})
  return (
    <div className='p-5 '>
      <div className="flex mt-1 px-4 border-2 border-gray-300 rounded p-1">
        {tags.map((tag, index) => {
          const width = `${addingIndex === index ? (addingValue.length ? ((addingValue.length) * 9 + 9) : 9) : 9}px`;
          const editWidth = `${editValue.length ? ((editValue.length) * 9 + 10) : 16}px`;

          return (
            editingIndex === index ? (
              <div key={index + tag.name} className='border w-auto rounded p-2 outline-0'>
                <input
                  ref={editRef}
                  style={{ width: editWidth }}
                  className={`border-0 border-gray-300 rounded text-black focus:outline-none inline-block `}
                  value={editValue}
                  onChange={handleEditInputChange}
                  onKeyDown={handleEditKeyPress}
                />
                <span className='cursor-pointer ml-1' onClick={() => { 
                  handleDelete(index); 
                  setEditingIndex(-1); 
                  setEditValue(''); 
                }}>x</span>
              </div>
            ) : (
              <div key={index + tag.name} className='flex'>
                <input
                  ref={addInputRef}
                  type="text"
                  style={{ width }}
                  className={`border-0 border-gray-300 rounded p-1 focus:outline-none inline-block ${addingIndex === index ? `opacity-1` : 'opacity-0'}`}
                  placeholder=""
                  autoFocus={addingIndex === index}
                  value={addingIndex === index ? addingValue : ''}
                  onClick={(e) => { setAddingValue(''); setAddingIndex(index); }}
                  onChange={handleAddingInputChange}
                  onKeyDown={handleKeyPress}
                />
                <div
                  key={index}
                  className={`rounded cursor-pointer flex items-center ${tag.type === 'value' ? 'hover:bg-slate-100 bg-slate-200 p-2' : ''}`}
                  onClick={() => { 
                    handleTagClick(index); 
                    setAddingIndex(-1); 
                    setAddingValue(''); 
                  }}
                >
                  {tag.name} (
                    {tag.type === 'value' && (
                    tag.value
                  )}
                  ) 
                  {tag.type === 'value' && (
                    <span className='cursor-pointer ml-1' onClick={(e) => { 
                      e.stopPropagation(); 
                      handleDelete(index); 
                      setEditingIndex(-1); 
                      setEditValue(''); 
                    }}>x</span>
                  )}
                </div>
              </div>
            )
          );
        })}
        <input
          ref={ref}
          type="text"
          className="border-0 rounded p-1 focus:outline-none min-[40px] w-full"
          placeholder={tags.length ? "" : "Type and press Enter to add tags"}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          onClick={(e) => { setAddingValue(''); setAddingIndex(-1); setEditingIndex(-1); setEditValue(''); }}
        />
      </div>

      <div className='flex'>Total: {evaluateExpression(tags.map((i)=> i.value).join(''))}</div>

      <ul className={`${(inputValue || editValue || addingValue) ? 'h-auto' : 'h-0'} overflow-hidden absolute w-80`}>
        {suggestions.map((suggestion, ind) => (
          <li
            key={suggestion.name + ind}
            className="cursor-pointer text-black hover:bg-slate-100 mt-2 bg-slate-200 px-3 py-1"
            onClick={() => handleSuggestionClick(suggestion)}
          >
            <div className='font-bold'>{suggestion.name}</div>
            <div className=''>{suggestion.description} ({suggestion.value})</div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TagInput;
