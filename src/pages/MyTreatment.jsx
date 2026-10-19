import React from 'react';
import {Navigate,useLocation} from 'react-router-dom';
// Preserve existing links while keeping one current hair-care record.
export default function LegacyHairCare(){const route=useLocation();return <Navigate to={'/HairJourney'+route.search+route.hash} replace/>;}
