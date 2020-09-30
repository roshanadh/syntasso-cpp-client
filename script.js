let baseURL = document.getElementById("baseURLInput").value;
let createConnectionBtn = document.getElementById("createConnectionBtn");

let addNewTestCaseBtn = document.getElementById("addNewTestCaseBtn");
let runBtn = document.getElementById("runBtn");
let clearBtn = document.getElementById("clearBtn");
let stdoutContainer = document.getElementById("stdout-container");

let socketConnection, socketId;
createConnectionBtn.addEventListener("click", (event) => {
	event.preventDefault();
	baseURL = document.getElementById("baseURLInput").value;
	socketConnection = io.connect(baseURL);

	socketConnection.on("connect", () => {
		socketId = socketConnection.id;
		console.log("socketId is: " + socketId);
		runBtn.disabled = false;
		clearBtn.disabled = false;
	});

	socketConnection.on("docker-app-stdout", (stdout) => {
		stdoutContainer.innerHTML += stdout.stdout + "<br />";
	});

	socketConnection.on("test-status", (stdout) => {
		console.dir({
			message: "test-status-event",
			...stdout,
		});
	});

	socketConnection.on("container-id", (containerId) => {
		console.log(containerId.containerId);
	});
});

addNewTestCaseBtn.addEventListener("click", (event) => {
	// create two new input fields; one for sampleInput and the other for expectedOutput
	event.preventDefault();
	const sampleInputEl = document.createElement("input");
	const expectedOutputEl = document.createElement("input");
	sampleInputEl.setAttribute("class", "sampleInput");
	expectedOutputEl.setAttribute("class", "expectedOutput");
	sampleInputEl.setAttribute(
		"placeholder",
		"sampleInput" + document.getElementsByClassName("sampleInput").length
	);
	expectedOutputEl.setAttribute(
		"placeholder",
		"expectedOutput" + document.getElementsByClassName("expectedOutput").length
	);
	sampleInputEl.type = "text";
	expectedOutputEl.type = "text";

	const testCases = document.getElementById("testCases");
	testCases.appendChild(sampleInputEl);
	testCases.innerHTML += "&nbsp";
	testCases.appendChild(expectedOutputEl);
	testCases.appendChild(document.createElement("br"));
});

runBtn.addEventListener("click", (event) => {
	event.preventDefault();
	let codeEditor = document.getElementById("code-editor");
	let dockerConfigField = document.getElementById("dockerConfig");

	const sampleInputs = Array.from(
		document.getElementsByClassName("sampleInput")
	);
	const expectedOutputs = Array.from(
		document.getElementsByClassName("expectedOutput")
	);

	const code = codeEditor.value;
	const dockerConfig = dockerConfigField.value || 0;
	let testCases = [];

	sampleInputs.forEach((sampleInput, index) => {
		let expectedOutput = expectedOutputs[index];
		testCases[index] = {
			sampleInput: sampleInput.value ? sampleInput.value : 0,
			expectedOutput: expectedOutput.value ? expectedOutput.value : 0,
		};
	});
	const payload = {
		code: `${code}`,
		socketId: `${socketId}`,
		dockerConfig: `${dockerConfig}`,
		testCases: testCases,
	};
	console.dir({ baseURL, testCases, payload, sampleInputs, expectedOutputs });
	if (code && code.trim() !== "") {
		try {
			fetch(`${baseURL}/submit`, {
				method: "POST",

				body: JSON.stringify(payload),
				headers: {
					"content-type": "application/json",
				},
			})
				.then((response) => {
					return response.json();
				})
				.then((res) => console.log(res));
		} catch (err) {
			console.err(err);
		}
	}
});

clearBtn.addEventListener("click", (event) => {
	stdoutContainer.innerHTML = "";
});
