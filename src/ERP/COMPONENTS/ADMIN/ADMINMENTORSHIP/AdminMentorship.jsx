/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

/* eslint-disable */
import React, { useState, useEffect } from "react";
import { theme } from "../../../theme";
import { supabase } from "../../../LIB/SUPABASE/supabaseClient";
import { useERP } from "../../../CONTEXT/ErpContext";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AdminMentorship() {
    const { userSession } = useERP();
    const [maxCapacity, setMaxCapacity] = useState(5);
    const [isProcessing, setIsProcessing] = useState(false);
    const [actionMessage, setActionMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const [unallocatedStudents, setUnallocatedStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);

    useEffect(() => {
        fetchMentorshipData();
    }, []);

    const fetchMentorshipData = async () => {
        try {
            const cachedStudents = sessionStorage.getItem('mentorship_students');
            const cachedFaculty = sessionStorage.getItem('mentorship_faculty');
            
            if (cachedStudents && cachedFaculty) {
                setUnallocatedStudents(JSON.parse(cachedStudents));
                setFaculty(JSON.parse(cachedFaculty));
                setIsLoading(false); 
            }

            const [
                { data: students, error: studentsError },
                { data: facultyData, error: facultyError },
                { data: mentorships, error: mentorshipsError }
            ] = await Promise.all([
                supabase.from('profiles').select('id, full_name, erp_id').eq('role', 'student'),
                supabase.from('profiles').select('id, full_name, department').eq('role', 'faculty'),
                supabase.from('mentorship').select('id, faculty_id, student_id')
            ]);

            if (studentsError) throw studentsError;
            if (facultyError) throw facultyError;
            if (mentorshipsError) throw mentorshipsError;

            const allocatedStudentIds = new Set((mentorships || []).map(m => m.student_id));
            
            const unallocated = (students || [])
                .filter(s => !allocatedStudentIds.has(s.id))
                .map(s => ({
                    id: s.id,
                    erp_id: s.erp_id || (s.id ? s.id.substring(0, 8) : 'Unknown'),
                    name: s.full_name || 'Unknown Student',
                    cgpa: "N/A"
                }));

            const facultyState = (facultyData || []).map(f => {
                const fMentorships = (mentorships || []).filter(m => m.faculty_id === f.id);
                const menteeIds = new Set(fMentorships.map(m => m.student_id));
                const mentees = (students || [])
                    .filter(s => menteeIds.has(s.id))
                    .map(s => ({
                        id: s.id,
                        erp_id: s.erp_id || (s.id ? s.id.substring(0, 8) : 'Unknown'),
                        name: s.full_name || 'Unknown Student',
                        cgpa: "N/A"
                    }));

                return {
                    id: f.id,
                    name: f.full_name || 'Unknown Faculty',
                    department: f.department || 'Law',
                    mentees: mentees
                };
            });

            setUnallocatedStudents(unallocated);
            setFaculty(facultyState);
            
            sessionStorage.setItem('mentorship_students', JSON.stringify(unallocated));
            sessionStorage.setItem('mentorship_faculty', JSON.stringify(facultyState));

        } catch (error) {
            console.error("Error fetching mentorship data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const shuffleArray = (array) => {
        let shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };

    const executeDistribution = async (studentsToDistribute, currentFacultyState) => {
        let pool = [...studentsToDistribute];
        let newFacultyState = currentFacultyState.map(f => ({ ...f, mentees: [...f.mentees] }));
        let newAllocations = [];

        let madeAllocation = true;
        while (pool.length > 0 && madeAllocation) {
            madeAllocation = false;
            for (let f of newFacultyState) {
                if (pool.length > 0 && f.mentees.length < maxCapacity) {
                    const student = pool.pop();
                    f.mentees.push(student);
                    newAllocations.push({ faculty_id: f.id, student_id: student.id });
                    madeAllocation = true;
                }
            }
        }

        if (newAllocations.length > 0) {
            try {
                const { error } = await supabase.from('mentorship').insert(newAllocations);
                if (error) throw error;
                
                setFaculty(newFacultyState);
                setUnallocatedStudents(pool);
                sessionStorage.setItem('mentorship_students', JSON.stringify(pool));
                sessionStorage.setItem('mentorship_faculty', JSON.stringify(newFacultyState));
            } catch (error) {
                console.error("Error saving allocations:", error);
                window.erpDialog.alert("Failed to save allocations.");
                fetchMentorshipData();
            }
        }
    };

    const triggerProcessing = (message, actionFn) => {
        if (isProcessing) return;
        setIsProcessing(true);
        setActionMessage(message);
        
        setTimeout(async () => {
            try {
                await actionFn();
            } finally {
                setIsProcessing(false);
                setActionMessage("");
            }
        }, 50);
    };

    const handleAutoAllocate = () => {
        triggerProcessing("Allocating students...", async () => {
            await executeDistribution(unallocatedStudents, faculty);
        });
    };

    const handleReshuffle = () => {
        triggerProcessing("Reshuffling batch...", async () => {
            const allStudentsCount = unallocatedStudents.length + faculty.reduce((acc, f) => acc + f.mentees.length, 0);
            if (allStudentsCount === 0) return;

            const { error: deleteError } = await supabase.from('mentorship').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (deleteError) {
                console.error("Error clearing allocations:", deleteError);
                return;
            }

            let allStudents = [...unallocatedStudents];
            faculty.forEach(f => {
                allStudents = [...allStudents, ...f.mentees];
            });

            const emptyFaculty = faculty.map(f => ({ ...f, mentees: [] }));
            const shuffledPool = shuffleArray(allStudents);

            await executeDistribution(shuffledPool, emptyFaculty);
        });
    };

    const handleClearAll = () => {
        triggerProcessing("Clearing allocations...", async () => {
            const { error: deleteError } = await supabase.from('mentorship').delete().neq('id', '00000000-0000-0000-0000-000000000000');
            if (deleteError) {
                console.error("Error clearing allocations:", deleteError);
                return;
            }

            let allStudents = [...unallocatedStudents];
            faculty.forEach(f => {
                allStudents = [...allStudents, ...f.mentees];
            });
            const newFacultyState = faculty.map(f => ({ ...f, mentees: [] }));
            
            setFaculty(newFacultyState);
            setUnallocatedStudents(allStudents);
            
            sessionStorage.setItem('mentorship_students', JSON.stringify(allStudents));
            sessionStorage.setItem('mentorship_faculty', JSON.stringify(newFacultyState));
        });
    };

    const handleRemoveStudent = async (facultyId, studentId) => {
        triggerProcessing("Removing student...", async () => {
            const { error } = await supabase
                .from('mentorship')
                .delete()
                .eq('faculty_id', facultyId)
                .eq('student_id', studentId);

            if (error) {
                console.error("Error removing student:", error);
                return;
            }

            const targetFaculty = faculty.find(f => f.id === facultyId);
            const targetStudent = targetFaculty.mentees.find(s => s.id === studentId);

            const newFacultyState = faculty.map(f => {
                if (f.id === facultyId) return { ...f, mentees: f.mentees.filter(s => s.id !== studentId) };
                return f;
            });
            const newUnallocated = [...unallocatedStudents, targetStudent];

            setFaculty(newFacultyState);
            setUnallocatedStudents(newUnallocated);

            sessionStorage.setItem('mentorship_students', JSON.stringify(newUnallocated));
            sessionStorage.setItem('mentorship_faculty', JSON.stringify(newFacultyState));
        });
    };

    const onDragEnd = async (result) => {
        const { source, destination } = result;

        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        triggerProcessing("Updating allocation...", async () => {
            let draggedStudent;
            let newUnallocated = [...unallocatedStudents];
            let newFaculty = faculty.map(f => ({ ...f, mentees: [...f.mentees] }));

            // Remove from source
            if (source.droppableId === 'unallocated') {
                draggedStudent = newUnallocated[source.index];
                newUnallocated.splice(source.index, 1);
            } else {
                const facIndex = newFaculty.findIndex(f => f.id === source.droppableId);
                draggedStudent = newFaculty[facIndex].mentees[source.index];
                newFaculty[facIndex].mentees.splice(source.index, 1);
            }

            // Add to destination
            if (destination.droppableId === 'unallocated') {
                newUnallocated.splice(destination.index, 0, draggedStudent);
                await supabase.from('mentorship').delete().eq('student_id', draggedStudent.id);
            } else {
                const facIndex = newFaculty.findIndex(f => f.id === destination.droppableId);
                
                // Enforce capacity rule on drag and drop
                if (newFaculty[facIndex].mentees.length >= maxCapacity) {
                    window.erpDialog?.alert("This mentor has reached maximum capacity!");
                    return; // Abort drag
                }

                newFaculty[facIndex].mentees.splice(destination.index, 0, draggedStudent);
                
                const { error } = await supabase.from('mentorship').upsert({
                    student_id: draggedStudent.id,
                    faculty_id: destination.droppableId
                }, { onConflict: 'student_id' });
            }

            setUnallocatedStudents(newUnallocated);
            setFaculty(newFaculty);
            sessionStorage.setItem('mentorship_students', JSON.stringify(newUnallocated));
            sessionStorage.setItem('mentorship_faculty', JSON.stringify(newFaculty));
        });
    };

    const totalAllocated = faculty.reduce((acc, curr) => acc + curr.mentees.length, 0);

    return (
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 lg:gap-8 pb-32 lg:pb-12 animate-fade-in selection:bg-themeElevated relative">

            {isProcessing && (
                <div className="fixed bottom-6 right-6 bg-themeElevated px-5 py-3 rounded-full border-theme border-themeBorderStrong flex items-center gap-3 animate-fade-in z-50 shadow-2xl">
                    <i className="fa-solid fa-circle-notch fa-spin text-themeAccent text-sm"></i>
                    <span className="text-xs font-black uppercase tracking-widest text-themeAccent">{actionMessage}</span>
                </div>
            )}

            {/* 1. HEADER BANNER */}
            <div className="bg-themeElevated rounded-themePanel p-6 lg:p-8 relative overflow-hidden border-theme border-themeBorder text-themeText flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div className="absolute top-0 right-0 w-64 h-64 lg:w-96 lg:h-96 bg-themeElevated rounded-full lg:-translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 lg:w-64 lg:h-64 bg-purple-500/10 rounded-full lg:translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                <div className="relative z-10 w-full lg:w-auto flex-1">
                    <div className="flex items-center gap-4 lg:gap-5 mb-3 lg:mb-2">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 bg-themeElevated border-theme border-themeBorderStrong rounded-themePanel flex items-center justify-center shrink-0">
                            <i className="fa-solid fa-network-wired text-themeAccent text-2xl lg:text-3xl"></i>
                        </div>
                        <div>
                            <h1 className={`${theme.text.heading} text-2xl lg:text-3xl tracking-tight text-themeText mb-1`}>Mentorship Engine</h1>
                            <p className={`${theme.text.secondary} text-xs lg:text-sm font-medium`}>Drag and drop students or auto-allocate advisees.</p>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full lg:w-auto shrink-0">
                    <div className="text-center px-6 py-3.5 lg:py-4 bg-themeApp border-theme border-themeBorderStrong rounded-themePanel flex lg:flex-col items-center justify-between lg:justify-center">
                        <p className="text-xl lg:text-3xl font-black text-emerald-400">
                            {isLoading ? <i className="fa-solid fa-circle-notch fa-spin text-lg opacity-50"></i> : totalAllocated} 
                            {!isLoading && <span className="text-[10px] lg:text-sm text-themeTextSec opacity-70 ml-1">/ {unallocatedStudents.length + totalAllocated}</span>}
                        </p>
                        <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeTextSec mt-0 lg:mt-1">Students Allocated</p>
                    </div>
                </div>
            </div>

            {/* 2. CONTROL PANEL */}
            <div className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-5 lg:p-6 flex flex-col xl:flex-row items-center justify-between gap-5 lg:gap-6 relative overflow-hidden z-20`}>
                <div className="flex items-center gap-4 w-full xl:w-auto shrink-0">
                    <div className="bg-themePanel p-3.5 lg:p-4 rounded-themePanel border-theme border-themeBorder flex items-center justify-between gap-4 lg:gap-6 w-full xl:w-auto">
                        <div>
                            <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-themeAccent mb-0.5">Max Capacity</p>
                            <p className="text-[10px] lg:text-xs font-semibold text-themeTextSec opacity-70">Per Faculty Mentor</p>
                        </div>
                        <div className="flex items-center bg-themeElevated rounded-themePanel border-theme border-themeBorderStrong overflow-hidden">
                            <button disabled={isProcessing} onClick={() => setMaxCapacity(Math.max(1, maxCapacity - 1))} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-themeAccent hover:bg-neutral-800 transition-colors border-r-theme border-themeBorderStrong active:scale-95 disabled:opacity-50">
                                <i className="fa-solid fa-minus text-[10px] lg:text-xs"></i>
                            </button>
                            <div className="w-12 h-10 lg:w-16 lg:h-12 flex items-center justify-center font-black text-themeText text-base lg:text-lg">
                                {maxCapacity}
                            </div>
                            <button disabled={isProcessing} onClick={() => setMaxCapacity(maxCapacity + 1)} className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center text-themeAccent hover:bg-neutral-800 transition-colors border-l-theme border-themeBorderStrong active:scale-95 disabled:opacity-50">
                                <i className="fa-solid fa-plus text-[10px] lg:text-xs"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap items-center justify-end gap-3 w-full xl:w-auto">
                    <button
                        onClick={handleClearAll}
                        disabled={totalAllocated === 0 || isProcessing}
                        className="w-full sm:w-auto px-5 lg:px-6 py-3.5 lg:py-4 bg-themeElevated hover:bg-themeElevated text-themeTextSec hover:text-rose-400 border-theme border-themeBorder hover:border-themeBorderStrong rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:hover:text-themeTextSec disabled:hover:border-themeBorder flex items-center justify-center gap-2 active:scale-95"
                    >
                        <i className="fa-solid fa-trash-can"></i> Clear All
                    </button>
                    <button
                        onClick={handleReshuffle}
                        disabled={isProcessing || (unallocatedStudents.length + totalAllocated === 0)}
                        className="w-full sm:w-auto px-5 lg:px-6 py-3.5 lg:py-4 bg-themeElevated hover:bg-amber-500 text-themeAccent hover:text-[#0a0a0a] border-theme border-themeBorderStrong hover:border-amber-500 rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                    >
                        <i className="fa-solid fa-shuffle"></i> Reshuffle All
                    </button>
                    <button
                        onClick={handleAutoAllocate}
                        disabled={unallocatedStudents.length === 0 || isProcessing}
                        className="w-full sm:w-auto px-5 lg:px-6 py-3.5 lg:py-4 bg-themeAccent hover:bg-themeAccentMuted text-themeText rounded-themePanel text-[10px] lg:text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 active:scale-[0.98] relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 w-full h-full -translate-x-full group-hover:translate-x-0 transition-transform duration-300 bg-white/10"></div>
                        <i className="fa-solid fa-wand-magic-sparkles text-sm lg:text-base relative z-10"></i> 
                        <span className="relative z-10">Auto-Allocate Pending</span>
                    </button>
                </div>
            </div>

            {/* 3. DASHBOARD SPLIT with Drag & Drop */}
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

                    {/* LEFT PANE: Unallocated Pool */}
                    <div className="lg:col-span-4 flex flex-col gap-3 lg:gap-4">
                        <div className="flex justify-between items-end mb-1 lg:mb-2 px-1">
                            <h2 className="text-base lg:text-lg font-black text-themeText tracking-tight">Unallocated Pool</h2>
                            <span className="text-[9px] lg:text-[10px] font-black bg-themePanel text-themeTextSec px-3 py-1.5 rounded-lg border-theme border-themeBorder">
                                {unallocatedStudents.length} Students
                            </span>
                        </div>

                        <Droppable droppableId="unallocated">
                            {(provided, snapshot) => (
                                <div 
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder p-3 lg:p-4 h-[400px] lg:h-[600px] overflow-y-auto no-scrollbar flex flex-col gap-2 relative transition-colors ${snapshot.isDraggingOver ? 'bg-themeElevated/50 border-themeBorderStrong' : ''}`}
                                >
                                    {isLoading ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-60">
                                            <i className="fa-solid fa-circle-notch fa-spin text-3xl text-themeAccent mb-4"></i>
                                            <h3 className="text-sm font-black text-themeText">Loading...</h3>
                                        </div>
                                    ) : unallocatedStudents.length === 0 ? (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 opacity-60">
                                            <i className="fa-solid fa-check-double text-4xl lg:text-5xl text-emerald-500 mb-4"></i>
                                            <h3 className="text-sm lg:text-base font-black text-themeText">Pool Empty</h3>
                                            <p className="text-[10px] lg:text-xs font-semibold text-themeTextSec opacity-70 mt-1.5">All students have been allocated to a mentor.</p>
                                        </div>
                                    ) : (
                                        unallocatedStudents.map((student, index) => (
                                            <Draggable key={student.id} draggableId={student.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div 
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className={`bg-themePanel p-3 lg:p-4 rounded-themePanel border-theme flex items-center justify-between group transition-colors ${snapshot.isDragging ? 'border-themeAccent shadow-[0_0_15px_rgba(var(--theme-accent),0.3)] bg-themeElevated z-50' : 'border-themeBorder hover:border-themeBorderStrong'}`}
                                                    >
                                                        <div>
                                                            <p className="text-xs lg:text-sm font-black text-themeText mb-0.5">{student.name}</p>
                                                            <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec opacity-70">{student.erp_id} • CGPA: {student.cgpa}</p>
                                                        </div>
                                                        <i className="fa-solid fa-grip-vertical text-themeTextSec opacity-30 group-hover:opacity-100 transition-opacity"></i>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))
                                    )}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>

                    {/* RIGHT PANE: Faculty Rosters */}
                    <div className="lg:col-span-8 flex flex-col gap-3 lg:gap-4">
                        <div className="flex justify-between items-end mb-1 lg:mb-2 px-1">
                            <h2 className="text-base lg:text-lg font-black text-themeText tracking-tight">Faculty Mentors</h2>
                            <span className="text-[9px] lg:text-[10px] font-black bg-themePanel text-themeTextSec px-3 py-1.5 rounded-lg border-theme border-themeBorder">
                                Capacity: {maxCapacity} per mentor
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className={`${theme.layout.panel} rounded-themePanel border-theme border-themeBorder flex flex-col overflow-hidden h-[300px] animate-pulse`}>
                                        <div className="p-4 lg:p-5 border-b-theme border-themeBorder bg-themeApp h-32"></div>
                                        <div className="p-3 lg:p-4 flex flex-col gap-2 flex-1"></div>
                                    </div>
                                ))
                            ) : faculty.map((fac) => {
                                const currentLoad = fac.mentees.length;
                                const isFull = currentLoad >= maxCapacity;
                                const loadPercentage = Math.min((currentLoad / maxCapacity) * 100, 100);

                                return (
                                    <div key={fac.id} className={`${theme.layout.panel} rounded-themePanel border-theme flex flex-col overflow-hidden transition-all duration-300 ${isFull ? 'border-themeBorderStrong' : 'border-themeBorder'}`}>

                                        <div className="p-4 lg:p-5 border-b-theme border-themeBorder bg-themeApp shrink-0">
                                            <div className="flex justify-between items-start mb-3 lg:mb-4">
                                                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-themeElevated text-themeAccent rounded-themePanel flex items-center justify-center font-black text-sm lg:text-base border-theme border-themeBorderStrong shrink-0">
                                                    {fac.name.charAt(0)}
                                                </div>
                                                <span className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md border-theme ${isFull ? 'bg-themeElevated text-themeAccent border-themeBorderStrong' : 'bg-themeElevated text-themeTextSec border-themeBorderStrong'}`}>
                                                    {currentLoad} / {maxCapacity}
                                                </span>
                                            </div>
                                            <h3 className="text-sm lg:text-base font-black text-themeText truncate mb-0.5">{fac.name}</h3>
                                            <p className="text-[9px] lg:text-[10px] font-bold text-themeTextSec opacity-70 uppercase tracking-widest truncate">{fac.department}</p>

                                            <div className="w-full h-1.5 lg:h-2 bg-neutral-800 rounded-full mt-4 lg:mt-5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-indigo-500' : 'bg-emerald-500'}`}
                                                    style={{ width: `${loadPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <Droppable droppableId={fac.id}>
                                            {(provided, snapshot) => (
                                                <div 
                                                    ref={provided.innerRef}
                                                    {...provided.droppableProps}
                                                    className={`p-3 lg:p-4 flex flex-col gap-2 flex-1 min-h-[150px] lg:min-h-[180px] max-h-[300px] overflow-y-auto no-scrollbar transition-colors ${snapshot.isDraggingOver ? (isFull ? 'bg-rose-500/10' : 'bg-emerald-500/10') : ''}`}
                                                >
                                                    {fac.mentees.length === 0 && !snapshot.isDraggingOver ? (
                                                        <div className="w-full h-full flex items-center justify-center text-center opacity-50 my-6 lg:my-8 pointer-events-none">
                                                            <p className="text-[10px] lg:text-xs font-bold text-themeTextSec opacity-70">No students allocated</p>
                                                        </div>
                                                    ) : (
                                                        fac.mentees.map((student, index) => (
                                                            <Draggable key={student.id} draggableId={student.id} index={index}>
                                                                {(provided, snapshot) => (
                                                                    <div 
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        className={`bg-themePanel border-theme p-2.5 lg:p-3 rounded-themePanel flex items-center justify-between group transition-colors ${snapshot.isDragging ? 'border-themeAccent shadow-[0_0_15px_rgba(var(--theme-accent),0.3)] bg-themeElevated z-50' : 'border-themeBorder hover:border-themeBorderStrong'}`}
                                                                    >
                                                                        <div className="min-w-0 pr-2">
                                                                            <p className="text-[10px] lg:text-xs font-black text-themeText truncate">{student.name}</p>
                                                                            <p className="text-[8px] lg:text-[9px] font-bold text-themeTextSec opacity-70 mt-0.5 truncate">{student.erp_id}</p>
                                                                        </div>
                                                                        <div className="flex gap-2 shrink-0">
                                                                            <i className="fa-solid fa-grip-vertical text-themeTextSec opacity-30 group-hover:opacity-100 transition-opacity"></i>
                                                                            <button
                                                                                onClick={() => handleRemoveStudent(fac.id, student.id)}
                                                                                disabled={isProcessing}
                                                                                className="w-6 h-6 rounded-lg bg-themeElevated border-theme border-themeBorderStrong text-themeTextSec opacity-70 hover:text-rose-500 hover:border-themeBorderStrong hover:bg-themeElevated flex items-center justify-center transition-colors lg:opacity-0 lg:group-hover:opacity-100 shrink-0 disabled:opacity-50"
                                                                                title="Remove from Mentor"
                                                                            >
                                                                                <i className="fa-solid fa-xmark text-[10px]"></i>
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </Draggable>
                                                        ))
                                                    )}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                </div>
            </DragDropContext>
        </div>
    );
}