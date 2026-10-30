import React from 'react';
import { germanLessons } from '../../data/germanLessons';
import { LessonDisplay } from '../../components/learn-german/LessonDisplay';

export const A2Dashboard: React.FC = () => {
  return <LessonDisplay data={germanLessons.a2} />;
};

export default A2Dashboard;
