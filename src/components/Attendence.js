import React, { useState, useEffect, useContext } from "react";
import Axios from "axios";
// import jsPDF from "jspdf";                                   //check
import { toast } from "react-toastify";
import { EmptyStateSmall } from "./EmptyState";
import { Download, PlayCircle, XCircle } from "react-feather";
import exceljs from "exceljs";
// import { useTimer } from 'react-timer-hook';
import MyTimer from "./MyTimer"; //new added part
import { ActiveContext } from "./contextAPI/ActiveContext"; //new added part
import axios from "axios";
import { qrContext } from "./contextAPI/qrContext"; //new added part
import QRCode from "react-qr-code"; //new added part
// import {Html5QrcodeScanner} from "html5-qrcode";                 //new added part

import QrScanner from "./QrScanner"; //new added part

import { ScannedContext } from "./contextAPI/ScannedContext"; //new added part

let userType = JSON.parse(localStorage.getItem("userType"));
let localdata = JSON.parse(localStorage.getItem("userDetails"));
let user = localdata
	? localdata
	: {
			fName: "",
			lName: "",
			email: "",
			password: "",
			_id: "404",
	  };

const generateExcel = (tickets) => {
	//updated part
	const workbook = new exceljs.Workbook();
	const worksheet = workbook.addWorksheet("Attendance");
	// const headerRow = worksheet.addRow(["Name", "Marked"]);
	// const headerRow = worksheet.addRow([
	// 	"Name",
	// 	`${tickets[0].date.substr(0, 10)}`,
	// ]);

	const headerRow = worksheet.addRow([
		"Name",
		`${tickets.length > 0 ? tickets[0].date.substr(0, 10) : ""}`,
	  ]);

	if (!tickets.length) return;

	// console.log(tickets);

	// fetch data of students in enrolled course;
	// const URL_hit_for_couse_std =  `http://localhost:8000/std/${course_id}`
	// axios.get(URL_hit_for_couse_std)

	tickets.forEach((ticket) => {
		const rowData = [ticket.student_name, "Present"];
		worksheet.addRow(rowData);
	});

	// Set the column widths for better readability
	worksheet.getColumn(1).width = 20;
	worksheet.getColumn(2).width = 10;

	// const sortedTickets = tickets.sort((a, b) => {
	//   // Sort based on the student_name (first column, index 0)
	//   const nameA = a.student_name.toUpperCase();
	//   const nameB = b.student_name.toUpperCase();
	//   if (nameA < nameB) return -1;
	//   if (nameA > nameB) return 1;
	//   return 0;
	// });

	// sortedTickets.forEach((ticket) => {
	//   const rowData = [ticket.student_name, "Present"];
	//   worksheet.addRow(rowData);
	// });

	// Generate the Excel file
	workbook.xlsx.writeBuffer().then((buffer) => {
		// Convert the buffer to a Blob
		const blob = new Blob([buffer], {
			type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
		});

		// Create a download link
		const downloadLink = document.createElement("a");
		downloadLink.href = window.URL.createObjectURL(blob);
		downloadLink.download = "attendance.xlsx";
		downloadLink.click();

		toast.success("Attendance data downloaded successfully.");
	});
};

// const generatePDF = (tickets) => {                           //check for generating pdf function
//     const doc = new jsPDF();
//     const tableColumn = ["Name", "Marked"];

//     const tableRows = [];
//     if (!tickets.length) return;

//     tickets.forEach((ticket) => {
//       const ticketData = [
//         ticket.student_name
//           .concat(" / ")
//           .concat("Present" + ""),
//       ];

//       tableRows.push(ticketData);
//     });

//     doc.autoTable(tableColumn, tableRows, { startY: 40 });

//     doc.addFont("Helvetica", "Helvetica", "");
//     doc.setFontSize(22);
//     doc.setFont("Helvetica", "bold");
//     doc.text("Attendance Report", 15, 20);

//     doc.setFontSize(16);
//     doc.setFont("Helvetica", "");
//     doc.text(`Attendence was submitted by ${tickets.length} students`, 15, 30);

//     doc.save(`attendence.pdf`);
//   };

const Attendence = ({ history }) => {
	const [attendenceInfo, setattendenceInfo] = React.useState(null);
	const [attendenceResponse, setAttendenceResponse] = React.useState(null);
	// const [isActive, setIsActive] = React.useState(                             //check
	// attendenceInfo ? attendenceInfo.is_active : false
	// );

	const { isActive, setIsActive } = useContext(ActiveContext); //updated part
	setIsActive(attendenceInfo ? attendenceInfo.is_active : false); //updated part

	const [attendenceResults, setAttendenceResults] = React.useState([]);
	const [hasSubmitted, setHasSubmitted] = React.useState(false);
	const forceUpdate = React.useCallback(() => setIgnore((v) => v + 1), []);
	const [ignore, setIgnore] = React.useState(0);

	const { qr, setqr } = useContext(qrContext);
	const qr_url = `http://localhost:3000/attendence/${qr}`; //new part added

	const { scan, setScan } = useContext(ScannedContext); //new part added

	// useEffect(() => {                                        //new added part
	//   if(qr) {
	//     window.location.href = `/attendance/${qr}`;
	//   }
	// },[scanResult]);

	React.useEffect(() => {
		{
			/* new added part starts */
		}
		let loc = window.location.href.split("/");
		let attendenceId = loc[loc.length - 1];
		Axios.get(`http://localhost:8000/api/attendence/${attendenceId}`).then(
			(res) => {
				if (res.data.success) {
					// console.log(res.data.success);
					// console.log(res.data.data._id);
					setqr(res.data.data._id);
				}
			}
		);
	}, [isActive]);
	{
		/* new added part ends */
	}

	React.useEffect(() => {
		let loc = window.location.href.split("/");
		let attendenceId = loc[loc.length - 1];
		Axios.get(`http://localhost:8000/api/attendence/${attendenceId}`).then(
			(res) => {
				if (res.data.success) {
					setattendenceInfo(res.data.data);
					setIsActive(res.data.data.is_active);
				}
			}
		);
	}, [isActive, hasSubmitted]);

	React.useEffect(() => {
		let loc = window.location.href.split("/");
		let attendenceId = loc[loc.length - 1];
		if (userType === "student") {
			Axios.get(
				`http://localhost:8000/api/attendence/hasSubmitted/${attendenceId}/${user._id}`
			).then((res) => {
				if (res.data.data) {
					setHasSubmitted(true);
				}
			});
		}
	}, []);

	React.useEffect(() => {
		//check
		window.scroll({ top: 0, left: 0, behavior: "smooth" });
		let loc = window.location.href.split("/");
		let attendenceId = loc[loc.length - 1];
		Axios.get(
			`http://localhost:8000/api/attendenceResult/${attendenceId}`
		).then((res) => {
			if (res.data.success) {
				setAttendenceResults(res.data.data);
			}
		});
	}, []);

	// React.useEffect(() => {                                                      //updated part
	//   window.scroll({ top: 0, left: 0, behavior: "smooth" });
	//   let loc = window.location.href.split("/");
	//   let attendenceId = loc[loc.length - 1];

	//   const fetchAttendanceResults = async () => {
	//     try {
	//       const res = await Axios.get(`http://localhost:8000/api/attendenceResult/${attendenceId}`);
	//       if (res.data.success) {
	//         setAttendenceResults(res.data.data);
	//       }
	//     } catch (error) {
	//       console.log("error in fetching the attendence response : ", error);
	//     }
	//   };

	//   fetchAttendanceResults();
	// }, [ignore]);

	const RenderAttendenceForStudent = () => {
		return;
	};

	const submitAttendence = () => {
		let loc = window.location.href.split("/");
		let responseObj = {
			attendance_id: loc[loc.length - 1],
			student_id: user._id,
			student_name: user.fName.concat(" ").concat(user.lName),
		};
		setAttendenceResponse(responseObj);

		if (attendenceInfo) {
			if (!attendenceInfo.is_active) {
				return toast.error("Attendence submission is closed");
			}
		}
		Axios.post("http://localhost:8000/api/submitAttendence", attendenceResponse)
			.then((res) => {
				if (res.data.success) {
				} else {
					toast.error("You have already submitted this Attendence");
				}
			})
			.catch((e) => toast.error("You have already submitted this Attendence"));
	};

	const startAttendence = () => {
		setIsActive(true);
		let loc = window.location.href.split("/");
		let attendenceId = loc[loc.length - 1];
		forceUpdate();
		Axios.post(
			`http://localhost:8000/api/startAttendence/${attendenceId}`
		).then((res) => {
			if (res.data.success) {
			}
		});
	};

	const endAttendence = () => {
		setIsActive(false);
		let loc = window.location.href.split("/");
		let attendenceId = loc[loc.length - 1];
		forceUpdate();
		Axios.post(`http://localhost:8000/api/endAttendence/${attendenceId}`).then(
			(res) => {
				if (res.data.success) {
				}
			}
		);
	};

	return (
		<div
			className={"background course-container"}
			style={{ paddingLeft: 0, paddingRight: 0, paddingBottom: 70 }}
		>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					alignItems: "center",
					marginTop: 25,
					marginLeft: 20,
				}}
			>
				<h2 className="course-title" style={{ fontSize: 30, margin: 0 }}>
					{attendenceInfo ? attendenceInfo.attendence_title : null}
				</h2>
			</div>

			<div //check for generating pdf button and updated part for generating excel sheet
				className={"new-post boxshadow"}
				style={{
					width: 60,
					height: 60,
					boxShadow: "1px 1px 5px #ababab",
					display: userType === "teacher" ? "flex" : "none",
				}}
				onClick={() =>
					generateExcel(attendenceResults ? attendenceResults : [])
				}
			>
				<Download size={30} color="white" />
			</div>
			{userType === "student" ? (
				<React.Fragment></React.Fragment>
			) : (
				<React.Fragment></React.Fragment>
			)}

			{userType === "teacher" ? (
				<React.Fragment>
					{/* <MyTimer endAttendence={endAttendence}/>                         new part to be added */}
					{/* Generate QR code */}
					<QRCode value={qr_url} />

					<div
						style={{
							position: "absolute",
							top: 100,
							right: 25,
							display: "flex",
							flexDirection: "row-reverse",
							alignItems: "center",
						}}
					>
						{!isActive ? (
							<button
								style={{
									paddingLeft: 15,
									transition: "0.5s ease",
									marginTop: 0,
									// width:120
								}}
								onClick={startAttendence}
								className="btn btn-new"
							>
								<PlayCircle size={22} color="white" />
								<p
									style={{
										fontSize: 16,
										fontWeight: 600,
										color: "#fff",
										margin: 0,
										fontFamily: "Poppins",
										letterSpacing: 0.8,
										// marginLeft: 10,
										marginTop: 0,
									}}
								>
									Begin Attendence
								</p>
							</button>
						) : (
							<button
								style={{
									paddingLeft: 15,
									transition: "0.5s ease",
									marginTop: 0,
									// width:120
								}}
								onClick={endAttendence}
								className="btn btn-new"
							>
								<XCircle size={22} color="white" />
								<p
									style={{
										fontSize: 16,
										fontWeight: 600,
										color: "#fff",
										margin: 0,
										fontFamily: "Poppins",
										letterSpacing: 0.8,
										// marginLeft: 10,
										// marginTop: 0,
										margin: "auto",
									}}
								>
									End Attendence
								</p>
							</button>
						)}
					</div>
				</React.Fragment>
			) : (
				<React.Fragment>
					{/* <div
                  style={{
                    width: "100%",
                    marginTop: 20,
                    borderTop: "3px solid",
                    paddingLeft: 25,
                    paddingTop: 30,
                    paddingBottom: 50,
                  }}
                  className="borderrad"
                >
                  {isActive ? (
                    !hasSubmitted ? (
                      <RenderQuizForStudent />
                    ) : (
                      <EmptyStateSmall
                        title="Response submitted"
                        d1="If you think this is a mistake, please contact your teacher"
                      />
                    )
                  ) : (
                    <EmptyStateSmall
                      title="Attendence has not started yet"
                      d1="If you think this is a mistake, please contact your teacher"
                    />
                  )}
                </div> */}
					{isActive && scan ? ( //new updated and added part
						<div
							style={{
								position: "fixed",
								top: 90,
								right: 25,
								display: "flex",
								flexDirection: "row-reverse",
								alignItems: "center",
							}}
						>
							<button
								className="btn btn-new"
								style={{ paddingLeft: 15 }}
								onClick={submitAttendence}
							>
								<p
									style={{
										fontSize: 16,
										fontWeight: 600,
										color: "#fff",
										margin: 0,
										fontFamily: "Poppins",
										letterSpacing: 0.8,
										// marginLeft: 5,
									}}
								>
									Submit
								</p>
							</button>
						</div>
					) : (
						<QrScanner />
					)}
				</React.Fragment>
			)}
		</div>
	);
};

export default Attendence;
