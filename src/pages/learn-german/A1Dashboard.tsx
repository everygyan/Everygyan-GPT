import React from 'react';
import { germanLessons } from '../../data/germanLessons';
import { LessonDisplay } from '../../components/learn-german/LessonDisplay';

export const A1Dashboard: React.FC = () => {
  return <LessonDisplay data={germanLessons.a1} />;
};

export default A1Dashboard;
