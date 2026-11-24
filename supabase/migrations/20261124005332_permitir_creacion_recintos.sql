CREATE POLICY "Provincial puede crear recintos"
ON public.recintos
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.perfiles
    WHERE perfiles.id = auth.uid()
    AND perfiles.rol = 'provincial'
  )
);