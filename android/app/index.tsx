import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const IndexScreen = () => {
  const router = useRouter();
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);

  useEffect(() => {
    // تحقق إذا كان المستخدم قد دخل من قبل
    const checkFirstTime = async () => {
      const hasVisitedBefore = await AsyncStorage.getItem('hasVisitedBefore');
      if (hasVisitedBefore) {
        setIsFirstTime(false);
      } else {
        setIsFirstTime(true);
        await AsyncStorage.setItem('hasVisitedBefore', 'true');
      }
    };
    checkFirstTime();
  }, []);

  useEffect(() => {
    if (isFirstTime === null) return; // لا نقوم بأي شيء إذا كانت القيمة لا تزال null
    if (isFirstTime === false) {
      router.replace('/sign-in');
    } else if (isFirstTime === true) {
      router.replace('/welcome');
    }
  }, [isFirstTime, router]);

  if (isFirstTime === null) {
    return null; // عرض فارغ أو شاشة تحميل حتى يتم تحديد الزيارة الأولى
  }

  return null; // لا نعرض أي شيء أثناء الانتظار
};

export default IndexScreen;
