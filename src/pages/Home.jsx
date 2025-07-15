import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';
import { Checkbox } from 'primereact/checkbox';
import { RadioButton } from 'primereact/radiobutton';
import { ProgressBar } from 'primereact/progressbar';
import { Card } from 'primereact/card';
import { TabView, TabPanel } from 'primereact/tabview';
import { ToggleButton } from 'primereact/togglebutton';
import { useState } from 'react';

function Home() {
	const [date, setDate] = useState(null);
	const [selectedOption, setSelectedOption] = useState(null);
	const [checked, setChecked] = useState(false);
	const [radioValue, setRadioValue] = useState(null);
	const [toggle, setToggle] = useState(false);

	const dropdownOptions = [
		{ label: 'Option 1', value: '1' },
		{ label: 'Option 2', value: '2' },
	];

	return (
		<div className="p-6 space-y-6">
			<h1 className="text-3xl font-bold">Welcome to the Home Page</h1>
			<p>You can only see this by visiting <code>/</code>.</p>

			<div className="flex flex-col gap-4 max-w-md">
				<InputText placeholder="InputText" />
				<Calendar value={date} onChange={(e) => setDate(e.value)} showIcon />
				<Dropdown value={selectedOption} options={dropdownOptions} onChange={(e) => setSelectedOption(e.value)} placeholder="Select an Option" />
				<div className="flex items-center gap-2">
					<Checkbox inputId="cb1" checked={checked} onChange={(e) => setChecked(e.checked)} />
					<label htmlFor="cb1">Checkbox</label>
				</div>
				<div className="flex items-center gap-4">
					<RadioButton inputId="rb1" name="rb" value="A" onChange={(e) => setRadioValue(e.value)} checked={radioValue === 'A'} />
					<label htmlFor="rb1">Option A</label>
					<RadioButton inputId="rb2" name="rb" value="B" onChange={(e) => setRadioValue(e.value)} checked={radioValue === 'B'} />
					<label htmlFor="rb2">Option B</label>
				</div>
				<ToggleButton checked={toggle} onChange={(e) => setToggle(e.value)} onLabel="On" offLabel="Off" />
				<ProgressBar value={50} />
				<Button label="Primary Button" />
			</div>

			<Card title="Sample Card" subTitle="Card Subtitle">
				<p>This is a PrimeReact card component for theme testing.</p>
			</Card>

			<TabView>
				<TabPanel header="Tab 1">
					<p>Tab 1 Content</p>
				</TabPanel>
				<TabPanel header="Tab 2">
					<p>Tab 2 Content</p>
				</TabPanel>
			</TabView>
		</div>
	);
}

export default Home;
