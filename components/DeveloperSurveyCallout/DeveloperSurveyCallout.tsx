import { Callout } from 'nextra-theme-docs';

function DeveloperSurveyCallout() {
	return (
		<div className='my-4'>
			<Callout emoji='🔍'>
				<p>
					<strong>Help Us Improve!</strong>
				</p>
				<p>
					We're conducting a short survey (less than 5 minutes) to gather your feedback and improve your development experience on Sei.{' '}
					<a
						className='nx-text-primary-600 nx-underline nx-decoration-from-font [text-underline-position:from-font]'
						href='https://forms.gle/eqkheVTwbK5HheLC6'
						target='_blank'
						rel='noopener'>
						Take the Survey Now
					</a>
				</p>
			</Callout>
		</div>
	);
}

export default DeveloperSurveyCallout;
