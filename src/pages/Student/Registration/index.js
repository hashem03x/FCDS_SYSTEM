import React, { useState, useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { ButtonGroup, Skeleton } from "@mui/material";
import Swal from "sweetalert2";
import { BASE_URL } from "../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import { faFloppyDisk, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function Registration() {
  const [courses, setCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [registeredSections, setRegisteredSections] = useState([]);
  const [selectedSections, setSelectedSections] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [schedule, setSchedule] = useState({});
  const { user } = useAuth();

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/student/available-courses/${user?.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to load courses");

      const data = await response.json();
      setCourses(data.courses);

      const initialSelections = {};
      data.courses.forEach((course) => {
        if (course.sections?.length > 0) {
          initialSelections[course.code] = course.sections[0].sectionId;
        }
      });
      setSelectedSections(initialSelections);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        timer: 2000,
        icon: "error",
        position: "top-right",
        showConfirmButton: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchCourses();
  }, [user?.id]);

  const parseTime = (timeStr) => {
    const [time, period] = timeStr.split(" ");
    const [hours, minutes] = time.split(":").map(Number);
    const h = period === "PM" && hours !== 12 ? hours + 12 : hours;
    return {
      hours: h,
      minutes,
      totalMinutes: h * 60 + minutes,
    };
  };

  const hasTimeConflict = (newDay, newStartTime, newEndTime) => {
    if (!schedule[newDay]) return false;

    const newStart = parseTime(newStartTime).totalMinutes;
    const newEnd = parseTime(newEndTime).totalMinutes;

    return schedule[newDay].some((item) => {
      const itemStart = parseTime(item.startTime).totalMinutes;
      const itemEnd = parseTime(item.endTime).totalMinutes;
      return (
        (newStart >= itemStart && newStart < itemEnd) ||
        (newEnd > itemStart && newEnd <= itemEnd) ||
        (newStart <= itemStart && newEnd >= itemEnd)
      );
    });
  };

  const isCourseRegistered = (courseCode) => {
    return registeredCourses.includes(courseCode);
  };

  const handleSectionChange = (courseCode, sectionId) => {
    setSelectedSections((prev) => ({
      ...prev,
      [courseCode]: sectionId,
    }));
  };

  const toggleCourseRegistration = (course) => {
    if (isCourseRegistered(course.code)) {
      removeCourseFromSchedule(course);
    } else {
      addCourseToSchedule(course);
    }
  };

  const addCourseToSchedule = (course) => {
    const lecture = course.lectureSessions[0];
    const selectedSectionId = selectedSections[course.code];
    const section = course.sections.find(
      (s) => s.sectionId === selectedSectionId
    );

    if (!section && course.sections?.length > 0) {
      Swal.fire({
        title: "Error",
        text: "Please select a section before registering",
        icon: "error",
        timer: 2000,
        position: "top-right",
        showConfirmButton: false,
      });
      return;
    }

    if (hasTimeConflict(lecture.day, lecture.startTime, lecture.endTime)) {
      Swal.fire({
        title: "Conflict!",
        text: "Lecture time conflicts with your schedule",
        icon: "warning",
        timer: 2000,
        position: "top-right",
        showConfirmButton: false,
      });
      return;
    }

    for (const session of section?.sessions || []) {
      if (hasTimeConflict(session.day, session.startTime, session.endTime)) {
        Swal.fire({
          title: "Conflict!",
          text: "Section time conflicts with your schedule",
          icon: "warning",
          timer: 2000,
          position: "top-right",
          showConfirmButton: false,
        });
        return;
      }
    }

    setSchedule((prev) => {
      const updated = { ...prev };

      const addToSchedule = (day, entry) => {
        if (!updated[day]) updated[day] = [];
        if (
          !updated[day].some(
            (item) => item.code === entry.code && item.type === entry.type
          )
        ) {
          updated[day].push(entry);
        }
      };

      addToSchedule(lecture.day, {
        type: "lecture",
        name: course.name,
        code: course.code,
        startTime: lecture.startTime,
        endTime: lecture.endTime,
        room: lecture.room,
      });

      section?.sessions?.forEach((session) => {
        addToSchedule(session.day, {
          type: "section",
          name: course.name,
          code: course.code,
          sectionId: section.sectionId,
          startTime: session.startTime,
          endTime: session.endTime,
          room: session.room,
          teachingAssistant: section.teachingAssistant,
        });
      });

      return updated;
    });

    setRegisteredCourses((prev) => [...new Set([...prev, course.code])]);
    if (section?.sectionId) {
      setRegisteredSections((prev) => [
        ...prev.filter((s) => s.courseCode !== course.code),
        {
          courseCode: course.code,
          sectionId: section.sectionId,
          teachingAssistant: section.teachingAssistant,
          sessions: section.sessions,
        },
      ]);
    }

    Swal.fire({
      title: "Success!",
      text: "Course added successfully",
      icon: "success",
      timer: 2000,
      position: "top-right",
      showConfirmButton: false,
    });
  };

  const removeCourseFromSchedule = (course) => {
    const courseCode = course.code;

    setSchedule((prev) => {
      const updated = {};
      for (const day in prev) {
        const filtered = prev[day].filter((item) => item.code !== courseCode);
        if (filtered.length) updated[day] = filtered;
      }
      return updated;
    });

    setRegisteredCourses((prev) => prev.filter((code) => code !== courseCode));
    setRegisteredSections((prev) =>
      prev.filter((s) => s.courseCode !== courseCode)
    );

    Swal.fire({
      title: "Removed!",
      text: "Course removed from schedule",
      icon: "success",
      timer: 2000,
      position: "top-right",
      showConfirmButton: false,
    });
  };
  return (
    <div>
      <CoursesTable
        courses={courses}
        isLoading={isLoading}
        isCourseRegistered={isCourseRegistered}
        toggleRegistration={toggleCourseRegistration}
        selectedSections={selectedSections}
        handleSectionChange={handleSectionChange}
        registeredSections={registeredSections}
        registeredCourses={registeredCourses}
        setRegisteredCourses={setRegisteredCourses}
        setRegisteredSections={setRegisteredSections}
        setSchedule={setSchedule}
        fetchCourses={fetchCourses}
        setIsLoading={setIsLoading}
      />
      <h3 style={{ marginTop: "20px", textAlign: "center" }}>
        Lecture Schedule
      </h3>
      <LectureSchedule schedule={schedule} />
    </div>
  );
}

function CoursesTable({
  courses,
  isLoading,
  isCourseRegistered,
  toggleRegistration,
  selectedSections,
  handleSectionChange,
  registeredSections,
  registeredCourses,
  setRegisteredCourses,
  setRegisteredSections,
  setSchedule,
  fetchCourses,
  setIsLoading,
}) {
  const { user } = useAuth();

  const handleClearAll = () => {
    setRegisteredCourses([]);
    setRegisteredSections([]);
    setSchedule({});
  };

  console.log(registeredSections);

  const handleRegister = async () => {
    if (registeredCourses.length === 0) {
      Swal.fire({
        title: "Error",
        text: "Please select at least one course to register",
        icon: "error",
        timer: 2000,
        position: "top-right",
        showConfirmButton: false,
      });
      return;
    }

    try {
      // 1. Register courses first
      const coursesResponse = await fetch(
        `${BASE_URL}/api/student/register-course/${user?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
          },
          body: JSON.stringify({ courseCodes: registeredCourses }),
        }
      );

      // 2. Check if course registration was successful
      if (!coursesResponse.ok) {
        const courseError = await coursesResponse.json();
        throw new Error(courseError.message || "Course registration failed");
      }
      const registrations = registeredSections.flatMap((course) =>
        course.sessions.map((session) => ({
          courseCode: course.courseCode,
          sectionId: course.sectionId,
        }))
      );
      const sectionsResponse = await fetch(
        `${BASE_URL}/api/student/register-section/${user?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
          },
          body: JSON.stringify({ registrations }),
        }
      );

      const sectionData = await sectionsResponse.json();

      if (!sectionsResponse.ok) {
        throw new Error(sectionData.message || "Section registration failed");
      }

      // 4. All good — success!
      Swal.fire({
        title: "Success",
        text: "Courses and sections registered successfully!",
        icon: "success",
        timer: 2000,
        position: "top-right",
        showConfirmButton: false,
      });

      // Reset states
      setRegisteredCourses([]);
      setRegisteredSections([]);
      setSchedule({});
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        timer: 2000,
        position: "top-right",
        showConfirmButton: false,
      });
      console.error("Registration error:", error);
    }
  };

  const getSelectedSectionForCourse = (courseCode) => {
    // For registered courses, use the registered section
    if (isCourseRegistered(courseCode)) {
      return registeredSections.find((s) => s.courseCode === courseCode);
    }
    // For unregistered courses, use the selected section
    return { sectionId: selectedSections[courseCode] };
  };

  const getSectionById = (course, sectionId) => {
    return course.sections?.find((s) => s.sectionId === sectionId);
  };

  const toggleUnRegister = async (course) => {
    console.log(course);
    setIsLoading(true);
    try {
      const response = await fetch(
        `${BASE_URL}/api/student/drop-course/${user?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("AuthToken")}`,
          },
          body: JSON.stringify({ courseCode: course.code }), // notice "courseCodes" (plural)
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to unRegister From Course");
      Swal.fire({
        title: "Success",
        text: "Unregistered successfully!",
        icon: "success",
        timer: 2000,
      });
      fetchCourses();
      setIsLoading(false);
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: error.message,
        icon: "error",
        timer: 2000,
        position: "top-right",
      });
      setIsLoading(false);
    }
  };

  return (
    <TableContainer
      component={Paper}
      sx={{ boxShadow: "0px -2px 31px 0px #00000024" }}
    >
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell>Course</TableCell>
            <TableCell align="center">Code</TableCell>
            <TableCell align="center">Dr</TableCell>
            <TableCell align="center">Lecture Time</TableCell>
            <TableCell align="center">TA</TableCell>
            <TableCell align="center">Section Time</TableCell>
            <TableCell align="center">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7} align="center">
                    <Skeleton width="100%" height={40} animation="wave" />
                  </TableCell>
                </TableRow>
              ))
            : courses.map((course) => {
                const selectedSection = getSelectedSectionForCourse(
                  course.code
                );
                const section = getSectionById(
                  course,
                  selectedSection?.sectionId
                );
                const hasSections = course.sections?.length > 0;

                return (
                  <TableRow key={course.code}>
                    <TableCell>{course.name}</TableCell>
                    <TableCell align="center">{course.code}</TableCell>
                    <TableCell align="center">د/{course.doctorName}</TableCell>
                    <TableCell align="center">
                      {course.lectureSessions[0].day.slice(0, 3)}{" "}
                      {course.lectureSessions[0].startTime} -{" "}
                      {course.lectureSessions[0].endTime}
                      <br />
                      {course.lectureSessions[0].room}
                    </TableCell>
                    <TableCell align="center">
                      {section?.teachingAssistant
                        ? `م/${section.teachingAssistant}`
                        : "-"}
                    </TableCell>
                    <TableCell align="center">
                      {hasSections ? (
                        <>
                          <Select
                            value={selectedSection?.sectionId || ""}
                            onChange={(e) => {
                              handleSectionChange(course.code, e.target.value);
                            }}
                            size="small"
                            disabled={isCourseRegistered(course.code)}
                            sx={{ width: "100%", mb: 1 }}
                          >
                            {course.sections.map((section) => (
                              <MenuItem
                                key={section.sectionId}
                                value={section.sectionId}
                              >
                                {section.sessions.map((session, idx) => (
                                  <div key={idx}>
                                    {`${session.day.slice(0, 3)} ${
                                      session.startTime
                                    }-${session.endTime}`}
                                    <br />
                                    {session.room} (TA:{" "}
                                    {section.teachingAssistant || "None"})
                                  </div>
                                ))}
                              </MenuItem>
                            ))}
                          </Select>
                        </>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color={
                          course.isRegistered || isCourseRegistered(course.code)
                            ? "error"
                            : "success"
                        }
                        onClick={() =>
                          course.isRegistered
                            ? toggleUnRegister(course)
                            : toggleRegistration(course)
                        }
                      >
                        {course.isRegistered
                          ? "Unregister"
                          : isCourseRegistered(course.code)
                          ? "Remove"
                          : "Register +"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
        </TableBody>
      </Table>
      <ButtonGroup
        sx={{
          padding: "12px",
          marginLeft: "auto",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <Button
          variant="contained"
          className="me-4"
          color="primary"
          onClick={() => handleRegister()}
        >
          Save <FontAwesomeIcon className="ms-3" icon={faFloppyDisk} />
        </Button>
        <Button
          onClick={() => handleClearAll()}
          variant="contained"
          color="error"
        >
          Clear All <FontAwesomeIcon className="ms-3" icon={faTrashCan} />
        </Button>
      </ButtonGroup>
    </TableContainer>
  );
}

function LectureSchedule({ schedule }) {
  const daysOfWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  return (
    <TableContainer
      component={Paper}
      className="mt-4"
      sx={{
        boxShadow: "0px -2px 31px 0px #00000024",
        backgroundColor: "#E8EBEE",
      }}
    >
      <Table sx={{ minWidth: 650 }} size="small" aria-label="lecture schedule">
        <TableHead>
          <TableRow>
            {daysOfWeek.map((day) => (
              <TableCell key={day} align="center">
                {day.slice(0, 3)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {daysOfWeek.map((day) => (
              <TableCell key={day} align="center">
                {schedule[day]?.length ? (
                  schedule[day].map((item, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "10px",
                        background:
                          item.type === "lecture" ? "#E0F7FA" : "#E8F5E9",
                        padding: "5px",
                        borderRadius: "5px",
                        borderLeft: `4px solid ${
                          item.type === "lecture" ? "#00ACC1" : "#66BB6A"
                        }`,
                      }}
                    >
                      <strong>{item.name}</strong> ({item.type})
                      {item.type === "section" && (
                        <>
                          <br />
                          TA: {item.teachingAssistant}
                        </>
                      )}
                      <br />
                      {item.startTime} - {item.endTime}
                      <br />
                      Room: {item.room}
                    </div>
                  ))
                ) : (
                  <span style={{ color: "#B5B7C0" }}>No Lectures</span>
                )}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default Registration;
