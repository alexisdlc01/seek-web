import { useState } from 'react'
import { Button } from 'primereact/button'
import { InputText } from 'primereact/inputtext'
import { Card } from 'primereact/card'
import { Checkbox } from 'primereact/checkbox'
import { Dropdown } from 'primereact/dropdown'

function App() {
  const [name, setName] = useState('')
  const [subscribe, setSubscribe] = useState(false)
  const [selectedCity, setSelectedCity] = useState(null)

  const cities = [
    { label: 'New York', value: 'NY' },
    { label: 'London', value: 'LDN' },
    { label: 'Tokyo', value: 'TKY' },
  ]

  return (
    <div className="p-4 flex justify-center">
      <Card title="PrimeReact Demo" className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="name" className="block mb-2 font-medium">Name</label>
          <InputText
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="city" className="block mb-2 font-medium">City</label>
          <Dropdown
            id="city"
            value={selectedCity}
            options={cities}
            onChange={(e) => setSelectedCity(e.value)}
            placeholder="Select a city"
            className="w-full"
          />
        </div>

        <div className="mb-4">
          <Checkbox
            inputId="subscribe"
            checked={subscribe}
            onChange={(e) => setSubscribe(e.checked)}
          />
          <label htmlFor="subscribe" className="ml-2">Subscribe to newsletter</label>
        </div>

        <Button
          label="Submit"
          icon="pi pi-check"
          onClick={() => alert(`Submitted: ${name}, ${selectedCity}, ${subscribe}`)}
          className="w-full"
        />
      </Card>
    </div>
  )
}

export default App
