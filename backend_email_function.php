<?php
// Add this function to your admin.php file

/**
 * Send check-in email notification to customer
 * This function should be added to your admin.php file
 */
function sendCheckInEmail($data) {
    try {
        // Extract data
        $customer_name = $data['customer_name'];
        $customer_email = $data['customer_email'];
        $reference_no = $data['reference_no'];
        $room_numbers = $data['room_numbers'];
        $roomtype_name = $data['roomtype_name'];
        $checkin_date = date('F j, Y g:i A', strtotime($data['checkin_date']));
        $checkout_date = date('F j, Y g:i A', strtotime($data['checkout_date']));

        // Email configuration (adjust these settings according to your email setup)
        $to = $customer_email;
        $subject = "Check-In Confirmation - Demiren Hotel & Restaurant";
        
        // Create HTML email content
        $message = "
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Check-In Confirmation</title>
            <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background-color: #34699a; color: white; padding: 20px; text-align: center; }
                .content { padding: 20px; background-color: #f9f9f9; }
                .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
                .detail-row { margin: 10px 0; }
                .label { font-weight: bold; color: #34699a; }
                .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class='container'>
                <div class='header'>
                    <h1>Welcome to Demiren Hotel & Restaurant</h1>
                    <h2>Check-In Confirmation</h2>
                </div>
                
                <div class='content'>
                    <p>Dear <strong>$customer_name</strong>,</p>
                    
                    <p>We are pleased to confirm that you have successfully checked in to Demiren Hotel & Restaurant. Below are your booking details:</p>
                    
                    <div class='booking-details'>
                        <div class='detail-row'>
                            <span class='label'>Reference Number:</span> $reference_no
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Room Number(s):</span> $room_numbers
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Room Type:</span> $roomtype_name
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Check-In Date:</span> $checkin_date
                        </div>
                        <div class='detail-row'>
                            <span class='label'>Check-Out Date:</span> $checkout_date
                        </div>
                    </div>
                    
                    <p><strong>Important Information:</strong></p>
                    <ul>
                        <li>Please keep your reference number for future reference</li>
                        <li>Room key cards are available at the front desk</li>
                        <li>Check-out time is 12:00 PM</li>
                        <li>For any assistance, please contact our front desk</li>
                    </ul>
                    
                    <p>We hope you enjoy your stay with us!</p>
                    
                    <p>Best regards,<br>
                    <strong>Demiren Hotel & Restaurant Team</strong></p>
                </div>
                
                <div class='footer'>
                    <p>This is an automated message. Please do not reply to this email.</p>
                    <p>© 2024 Demiren Hotel & Restaurant. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
        ";

        // Email headers
        $headers = "MIME-Version: 1.0" . "\r\n";
        $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
        $headers .= "From: Demiren Hotel & Restaurant <noreply@demirenhotel.com>" . "\r\n";
        $headers .= "Reply-To: info@demirenhotel.com" . "\r\n";

        // Send email
        if (mail($to, $subject, $message, $headers)) {
            return array('success' => true, 'message' => 'Check-in email sent successfully');
        } else {
            return array('success' => false, 'message' => 'Failed to send email');
        }
        
    } catch (Exception $e) {
        return array('success' => false, 'message' => 'Error: ' . $e->getMessage());
    }
}

// Add this case to your main switch statement in admin.php
/*
case 'sendCheckInEmail':
    $json = json_decode($_POST['json'], true);
    $result = sendCheckInEmail($json);
    echo json_encode($result);
    break;
*/

// Alternative using PHPMailer (recommended for production)
/*
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

function sendCheckInEmailWithPHPMailer($data) {
    require_once 'vendor/autoload.php'; // Include PHPMailer autoload
    
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com'; // Set your SMTP server
        $mail->SMTPAuth   = true;
        $mail->Username   = 'your-email@gmail.com'; // Your email
        $mail->Password   = 'your-app-password'; // Your app password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        // Recipients
        $mail->setFrom('noreply@demirenhotel.com', 'Demiren Hotel & Restaurant');
        $mail->addAddress($data['customer_email'], $data['customer_name']);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Check-In Confirmation - Demiren Hotel & Restaurant';
        $mail->Body    = // Same HTML content as above
        
        $mail->send();
        return array('success' => true, 'message' => 'Check-in email sent successfully');
    } catch (Exception $e) {
        return array('success' => false, 'message' => "Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    }
}
*/
?>