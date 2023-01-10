import React, { useEffect, useState } from 'react'
import axios from 'axios'

import './App.css'

interface UsersType {
  id: number,
  name: string,
  email: string,
  address: {
    street: string,
    suite: string,
    city: string,
    zipcode: string,
    geo: {
      lat: string,
      lng: string,
    }
  },
  phone: string,
  website: string,
  company: {
    name: string,
    catchPhrase: string,
    bs: string
  }
}

function App() {
  const [users, setUsers] = useState<UsersType[]>([])

  useEffect(() => {
    axios.get('/users.json').then((res) => {
      setUsers(res.data)
    })
  }, [users])

  return (
    <div>
      <ul className="users">
        {users.map((user) => (
          <li className="user" key={user.id}>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>City:</strong> {user.address.city}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App
