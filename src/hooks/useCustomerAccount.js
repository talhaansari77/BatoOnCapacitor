import {useQuery} from '@tanstack/react-query';
import {base44} from '@/api/base44Client';
export function useCustomerAccount(){return useQuery({queryKey:['customerAccount'],queryFn:()=>base44.auth.me(),retry:1,staleTime:0,gcTime:0,refetchOnMount:'always'});}
