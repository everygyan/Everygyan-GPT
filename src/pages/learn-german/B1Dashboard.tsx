import React from 'react';
import { germanLessons } from '../../data/germanLessons';
import { LessonDisplay } from '../../components/learn-german/LessonDisplay';

export const B1Dashboard: React.FC = () => {
  return <LessonDisplay data={germanLessons.b1} />;
};

export default B1Dashboard;
