'use client'

import { useState } from 'react';
import { useChat } from 'ai/react';
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"

export default function PrayTellUI() {
  const { messages, input, handleInputChange, handleSubmit } = useChat();
  const [userInfo, setUserInfo] = useState({
    name: 'John Doe',
    location: 'New York, USA',
    avatarUrl: '/api/placeholder/40/40'
  });

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">PrayTell UI</h1>
      
      <div className="bg-gray-100 p-4 rounded-lg mb-4 flex items-center">
        <Avatar className="mr-4">
          <AvatarImage src={userInfo.avatarUrl} alt={userInfo.name} />
          <AvatarFallback>{userInfo.name[0]}</AvatarFallback>
        </Avatar>
        <div>
          <h2 className="font-semibold">{userInfo.name}</h2>
          <p className="text-sm text-gray-500">{userInfo.location}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        {messages.map(m => (
          <div key={m.id} className="mb-4">
            <p className="font-semibold">{m.role === 'user' ? 'You' : 'AI'}:</p>
            <p>{m.content}</p>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="mt-4 flex">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-grow mr-2"
        />
        <Button type="submit">Send</Button>
      </form>
    </div>
  );
}